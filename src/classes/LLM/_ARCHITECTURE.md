/**

- 架構設計文檔
-
- 這個文件詳細說明了 Universal LLM 架構的設計理念和實作細節 */

## 核心設計原則

### 1. 關注點分離 (Separation of Concerns)

```
┌─────────────────────────────────────────────────────────────┐
│                      應用層 (Discord Bot)                    │
│                                                              │
│  - 處理 Discord 事件                                         │
│  - 管理聊天會話                                              │
│  - 決定何時呼叫 LLM                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 使用簡單的 API
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 對話管理層 (UniversalLLM)                    │
│                                                              │
│  - 管理對話歷史                                              │
│  - 系統提示詞處理                                            │
│  - 提供統一的訊息格式                                        │
│  - 簡化的 chat() / sendMessage() API                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 委託給適配器
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   適配器層 (LLMAdapter)                      │
│                                                              │
│  - 格式轉換: Universal ↔ Provider-specific                  │
│  - 驗證請求是否符合模型能力                                  │
│  - 錯誤處理和類型轉換                                        │
│  - 成本計算                                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 各自的實作
                           ↓
┌─────────────┬────────────┬────────────┬──────────────────────┐
│ GrokAdapter │OpenAIAdapter│ClaudeAdapter│  ...更多適配器    │
│             │            │            │                      │
│  Grok API   │ OpenAI API │Anthropic API│                     │
└─────────────┴────────────┴────────────┴──────────────────────┘
```

### 2. 黑盒抽象

LLM 服務被視為黑盒:

- **輸入**: 標準化的 `UniversalChatRequest`
- **輸出**: 標準化的 `UniversalChatResponse`
- **內部**: 我們不關心 API 如何實作,只關心輸入輸出格式

### 3. 開放-封閉原則 (Open-Closed Principle)

- **對擴展開放**: 新增提供者只需實作一個 `LLMAdapter`
- **對修改封閉**: 新增提供者不需要修改現有代碼

## 資料流程

### 發送訊息的流程

```
使用者輸入
    │
    ↓
Discord Bot 處理
    │
    ↓
llm.sendMessage("Hello")
    │
    ↓
UniversalLLM: 建立 UniversalMessage
    │
    ├─ 加入系統提示詞
    ├─ 加入對話歷史
    └─ 建立完整的 messages 陣列
    │
    ↓
UniversalLLM: 建立 UniversalChatRequest
    │
    ├─ messages: UniversalMessage[]
    ├─ temperature: 0.8
    ├─ max_tokens: 1000
    └─ ...其他參數
    │
    ↓
Adapter: 驗證請求
    │
    ├─ 檢查是否支援圖片輸入
    ├─ 檢查是否支援 function calling
    └─ ...其他能力檢查
    │
    ↓
Adapter: 格式轉換
    │
    ├─ UniversalMessage → Grok/OpenAI/Claude 格式
    ├─ UniversalContentPart → 各家的多模態格式
    └─ 參數映射
    │
    ↓
HTTP 請求到 LLM API
    │
    ↓
收到回應
    │
    ↓
Adapter: 格式轉換
    │
    ├─ Grok/OpenAI/Claude 回應 → UniversalChatResponse
    ├─ 提取 usage 統計
    └─ 處理模型特定的額外資訊
    │
    ↓
UniversalLLM: 更新對話歷史
    │
    ├─ 加入使用者訊息
    └─ 加入助理回應
    │
    ↓
返回給應用層
    │
    ↓
Discord Bot 發送訊息
```

## 類型系統設計

### Universal 類型的設計考量

```typescript
// 訊息內容可以是:
// 1. 簡單文字
// 2. 多模態內容陣列 (文字 + 圖片 + ...)
// 3. null (用於 tool calling)
content: string | UniversalContentPart[] | null;

// 為什麼這樣設計?
// - 簡單文字: 最常見的情況,方便使用
// - 多模態陣列: 支援圖片等複雜輸入
// - null: OpenAI/Anthropic 在 tool response 時允許 null
```

### 泛型使用

```typescript
// Adapter 的 chat 方法返回 Result 類型
async chat(request): Promise<Result<UniversalChatResponse, LLMError>>

// 好處:
// 1. 強制錯誤處理 (不能忽略錯誤)
// 2. 類型安全 (TypeScript 會檢查)
// 3. 統一的錯誤處理模式
```

## 適配器實作指南

### 必須實作的方法

```typescript
abstract class LLMAdapter {
    // 1. 非串流聊天 (必須)
    abstract chat(
        request: UniversalChatRequest,
    ): Promise<Result<UniversalChatResponse, LLMError>>;

    // 2. 串流聊天 (必須)
    abstract chatStream(
        request: UniversalChatRequest,
    ): AsyncGenerator<UniversalChatChunk, void, unknown>;

    // 3. 成本計算 (必須,如果不支援返回 null)
    abstract calculateCost(usage: UniversalUsage): UniversalCost | null;
}
```

### 格式轉換的關鍵點

```typescript
// 1. 訊息角色映射
Universal     →  Grok        →  OpenAI      →  Claude
'system'      →  'system'    →  'system'    →  'system' (via system param)
'user'        →  'user'      →  'user'      →  'user'
'assistant'   →  'assistant' →  'assistant' →  'assistant'
'tool'        →  'tool'      →  'tool'      →  'user' (with tool_result)

// 2. 多模態內容
Universal image → Grok: image_url with data URI
                → OpenAI: image_url with URL or data URI
                → Claude: image with base64 in content block

// 3. Function calling
Universal tools → Grok: tools (OpenAI 格式)
                → OpenAI: tools
                → Claude: tools (不同格式,需轉換)
```

## 錯誤處理策略

### 錯誤類型設計

```typescript
enum LLMErrorType {
    AUTHENTICATION, // API key 問題 → 不可重試
    RATE_LIMIT, // 超過速率限制 → 可重試 (需等待)
    INVALID_REQUEST, // 請求格式錯誤 → 不可重試
    MODEL_ERROR, // 模型錯誤 → 可能可重試
    NETWORK_ERROR, // 網路錯誤 → 可重試
    TIMEOUT, // 超時 → 可重試
    UNKNOWN, // 未知錯誤 → 視情況
}
```

### 錯誤處理流程

```typescript
try {
    const response = await fetch(API_URL, ...);
    return [await response.json(), null];
} catch (error) {
    // 1. 識別錯誤類型
    const llmError = this.handleError(error);
    
    // 2. 返回結構化錯誤
    return [null, llmError];
}

// 應用層處理
const [response, error] = await llm.chat(request);
if (error) {
    if (error.retryable && retries < MAX_RETRIES) {
        // 重試
        await sleep(error.retryAfter || 1000);
        return this.chat(request);
    } else {
        // 通知使用者
        return { success: false, message: error.message };
    }
}
```

## 效能考量

### 1. 串流 vs 非串流

```typescript
// 非串流: 等待完整回應
const [response, error] = await llm.chat(message);
console.log(response.content); // 一次性輸出

// 串流: 即時顯示
for await (const chunk of llm.chatStream(message)) {
    process.stdout.write(chunk.delta.content); // 逐字輸出
}

// Discord Bot 建議使用串流 + 定期更新訊息
```

### 2. 對話歷史管理

```typescript
// 問題: 對話歷史太長會:
// - 消耗大量 tokens (費用增加)
// - 超過 context length 限制
// - 回應變慢

// 解決方案:
llm.limitHistory(10); // 只保留最近 10 條訊息

// 或實作智能摘要:
if (history.length > 20) {
    const summary = await llm.summarize(history.slice(0, -10));
    llm.setHistory([
        { role: "system", content: summary },
        ...history.slice(-10),
    ]);
}
```

### 3. 快取和重用

```typescript
// 未來可以實作:
// - 請求快取 (相同輸入返回快取結果)
// - Adapter 實例池 (重用連接)
// - 成本追蹤 (監控使用量)
```

## 擴展性設計

### 新增功能的擴展點

```typescript
// 1. 新增模型特定參數
interface UniversalChatRequest {
    // ...標準參數
    extra?: Record<string, any>;  // 擴展點
}

// 使用:
await llm.chat(message, {
    extra: {
        reasoning_effort: 'high',    // Grok 特定
        safety_settings: {...},       // Gemini 特定
        stop_sequences: [...],        // Claude 特定
    }
});

// 2. 新增回應資訊
interface UniversalChatResponse {
    // ...標準欄位
    reasoning_content?: string;  // Grok 推理
    citations?: any[];           // Grok 搜尋引用
    raw?: any;                   // 保留原始回應
}

// 3. 新增適配器鉤子
abstract class LLMAdapter {
    // 子類可覆寫
    protected beforeRequest(request: UniversalChatRequest): void {}
    protected afterResponse(response: UniversalChatResponse): void {}
}
```

### 未來功能規劃

```typescript
// 1. 自動重試機制
class RetryableLLM extends UniversalLLM {
    async chat(message, options) {
        for (let i = 0; i < MAX_RETRIES; i++) {
            const [response, error] = await super.chat(message, options);
            if (!error || !error.retryable) return [response, error];
            await sleep(error.retryAfter || backoff(i));
        }
    }
}

// 2. 成本控制
class BudgetLLM extends UniversalLLM {
    private totalCost = 0;
    private budget = 10.0; // USD

    async chat(message, options) {
        if (this.totalCost >= this.budget) {
            return [null, new LLMError("Budget exceeded")];
        }

        const [response, error] = await super.chat(message, options);
        if (response) {
            this.totalCost += this.calculateCost(response.usage).amount;
        }
        return [response, error];
    }
}

// 3. 多模型負載平衡
class LoadBalancedLLM {
    private llms: UniversalLLM[];

    async chat(message, options) {
        // 選擇負載最低的模型
        const llm = this.selectLLM();
        return llm.chat(message, options);
    }
}
```

## 測試策略

### 單元測試

```typescript
// 測試適配器的格式轉換
describe("GrokAdapter", () => {
    it("should convert UniversalMessage to Grok format", () => {
        const adapter = new GrokAdapter(apiKey, "grok-4");
        const universal = {
            role: "user",
            content: "Hello",
        };
        const grok = adapter["toGrokMessage"](universal);
        expect(grok).toEqual({
            role: "user",
            content: "Hello",
        });
    });
});

// 測試 UniversalLLM 的歷史管理
describe("UniversalLLM", () => {
    it("should limit history correctly", () => {
        const llm = new UniversalLLM({ model: "grok-4", apiKey: "test" });
        // 添加 20 條訊息
        for (let i = 0; i < 20; i++) {
            llm.addToHistory({ role: "user", content: `Message ${i}` });
        }
        llm.limitHistory(10);
        expect(llm.getHistory().length).toBe(10);
    });
});
```

### 整合測試

```typescript
// 測試完整流程 (需要真實 API key)
describe("Integration", () => {
    it("should complete a chat request", async () => {
        const llm = UniversalLLM.create("grok-4", process.env.GROK_API_KEY);
        const [response, error] = await llm.sendMessage('Say "Hello"');

        expect(error).toBeNull();
        expect(response).toContain("Hello");
    });
});
```

## 總結

這個架構的核心優勢:

1. **簡單**: 應用層只需要 `llm.sendMessage()` 就能用
2. **靈活**: 輕鬆切換模型,只需改一個字串
3. **可擴展**: 新增提供者只需一個適配器
4. **類型安全**: 完整的 TypeScript 支援
5. **易維護**: 每個層次職責清晰

記住設計原則:

- 聊天控制模組 → 只關心對話邏輯
- UniversalLLM → 只關心歷史管理
- Adapter → 只關心格式轉換
- LLM API → 黑盒子
