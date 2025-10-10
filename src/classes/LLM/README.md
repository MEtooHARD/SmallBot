# Universal LLM 架構

一個通用的大語言模型整合架構,支援多個 LLM 提供者 (Grok, OpenAI, Anthropic 等)。

## 🎯 設計目標

1. **統一介面**: 聊天控制模組只需要學習一套 API
2. **模型無關**: 輕鬆切換不同的 LLM 提供者和模型
3. **黑盒抽象**: LLM 服務被視為黑盒,輸入標準格式,輸出標準格式
4. **類型安全**: 完整的 TypeScript 類型支援
5. **易於擴展**: 新增提供者只需實作一個 Adapter

## 📁 檔案結構

```
src/classes/LLM/
├── UniversalTypes.ts    # 通用類型定義
├── BaseAdapter.ts       # 適配器基類和工廠
├── GrokAdapter.ts       # Grok 適配器實作
├── UniversalLLM.ts      # 統一的 LLM 管理器 (主要 API)
├── init.ts              # 初始化和註冊適配器
├── examples.ts          # 使用範例
└── README.md            # 本文件
```

## 🏗️ 架構圖

```
┌─────────────────────────────────────────────┐
│         聊天控制模組 (Chat Manager)          │
│     - 管理聊天行為                           │
│     - 選擇模型                               │
│     - 提供原始聊天資訊                        │
└──────────────────┬──────────────────────────┘
                   │
                   │ 使用統一介面
                   ↓
┌─────────────────────────────────────────────┐
│          UniversalLLM (統一管理器)           │
│     - 對話歷史管理                           │
│     - 系統提示詞管理                          │
│     - 簡化的 API                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ 委託給適配器
                   ↓
┌─────────────────────────────────────────────┐
│            LLMAdapter (適配器層)             │
│     - 格式轉換 (Universal ↔ Provider)        │
│     - 模型能力檢查                           │
│     - 錯誤處理                               │
└──────────────────┬──────────────────────────┘
                   │
                   │ 各自的實作
                   ↓
┌──────────────┬──────────────┬───────────────┐
│ GrokAdapter  │ OpenAIAdapter│ ClaudeAdapter │
│              │              │               │
│ ↓            │ ↓            │ ↓             │
│ Grok API     │ OpenAI API   │ Anthropic API │
└──────────────┴──────────────┴───────────────┘
```

## 🚀 快速開始

### 基本使用

```typescript
import { UniversalLLM } from "./classes/LLM/UniversalLLM";
import "./classes/LLM/init"; // 註冊適配器

// 1. 創建 LLM 實例
const llm = UniversalLLM.create(
    "grok-4", // 模型名稱
    "your-api-key", // API key
    "You are a helpful assistant.", // 系統提示詞
);

// 2. 發送訊息
const [response, error] = await llm.sendMessage("Hello!");

if (error) {
    console.error("Error:", error.message);
} else {
    console.log("Assistant:", response);
}
```

### 多輪對話

```typescript
const llm = new UniversalLLM({
    model: "grok-4",
    apiKey: "your-api-key",
    system_prompt: "You are a helpful assistant.",
    temperature: 0.8,
});

// 對話會自動記錄歷史
await llm.sendMessage("My name is Alice.");
const [response, _] = await llm.sendMessage("What is my name?");
console.log(response); // "Your name is Alice."
```

### 串流回應

```typescript
const message = {
    role: "user" as const,
    content: "Tell me a story.",
};

for await (const chunk of llm.chatStream(message)) {
    if (chunk.delta.content) {
        process.stdout.write(chunk.delta.content);
    }
}
```

### 多模態輸入 (圖片)

```typescript
const message = {
    role: "user" as const,
    content: [
        { type: "text" as const, text: "What do you see?" },
        {
            type: "image" as const,
            mime_type: "image/jpeg" as const,
            data: "base64-encoded-image",
            detail: "high" as const,
        },
    ],
};

const [response, error] = await llm.chat(message);
```

## 🔌 支援的模型

### Grok (已實作)

- `grok-4-0709`, `grok-4`, `grok-4-latest`
- `grok-3-mini`, `grok-3-mini-latest`, `grok-3-mini-beta`

### 其他 (待實作)

- OpenAI: `gpt-4`, `gpt-3.5-turbo`, 等
- Anthropic: `claude-3-opus`, `claude-3-sonnet`, 等
- Google: `gemini-pro`, `gemini-ultra`, 等

## 📚 核心概念

### 1. 統一的訊息格式 (`UniversalMessage`)

```typescript
interface UniversalMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string | UniversalContentPart[] | null;
    name?: string; // 發送者名稱
    tool_calls?: UniversalToolCall[];
    tool_call_id?: string;
}
```

### 2. 統一的請求參數 (`UniversalChatRequest`)

```typescript
interface UniversalChatRequest {
    messages: UniversalMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    // ... 其他通用參數
    extra?: Record<string, any>; // 模型特定參數
}
```

### 3. 統一的回應格式 (`UniversalChatResponse`)

```typescript
interface UniversalChatResponse {
    id: string;
    model: string;
    content: string | null;
    finish_reason: 'stop' | 'length' | 'tool_calls' | ...;
    usage: UniversalUsage;
    // ... 模型特定的額外資訊
}
```

### 4. 適配器模式

每個 LLM 提供者都有一個適配器,負責:

- 將 `UniversalChatRequest` 轉換為該提供者的 API 格式
- 將該提供者的回應轉換回 `UniversalChatResponse`
- 處理該提供者特有的功能和限制

## 🛠️ 新增提供者

要新增一個新的 LLM 提供者,只需三步:

### 1. 實作適配器

```typescript
// src/classes/LLM/OpenAIAdapter.ts
export class OpenAIAdapter extends LLMAdapter {
    async chat(
        request: UniversalChatRequest,
    ): Promise<Result<UniversalChatResponse, LLMError>> {
        // 轉換請求格式
        const openaiParams = this.toOpenAIParams(request);

        // 呼叫 OpenAI API
        const response = await openai.chat.completions.create(openaiParams);

        // 轉換回應格式
        return [this.fromOpenAIResponse(response), null];
    }

    // ... 實作其他必要方法
}
```

### 2. 註冊適配器

```typescript
// src/classes/LLM/init.ts
AdapterFactory.register(
    'openai',
    (apiKey, modelName) => new OpenAIAdapter(apiKey, modelName),
    ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', ...]
);
```

### 3. 使用

```typescript
const llm = UniversalLLM.create("gpt-4", "openai-api-key");
await llm.sendMessage("Hello!");
```

就這麼簡單!

## 🎯 與現有代碼整合

### 遷移現有的 Chat 類別

```typescript
class Chat {
    private llm: UniversalLLM;

    constructor(model: string, apiKey: string) {
        this.llm = new UniversalLLM({
            model: model,
            apiKey: apiKey,
            system_prompt: this.buildSystemPrompt(),
            temperature: 1.3,
        });
    }

    async onMessage(username: string, content: string): Promise<string> {
        // 限制歷史長度
        this.llm.limitHistory(10);

        // 發送訊息
        const [response, error] = await this.llm.chat({
            role: "user",
            content: content,
            name: username,
        });

        return response?.content || "Error";
    }
}
```

## 🔍 檢查模型能力

```typescript
const llm = UniversalLLM.create("grok-4", apiKey);
const info = llm.getModelInfo();

// 檢查功能支援
if (info.capabilities.image_input) {
    console.log("This model supports image input");
}

if (info.capabilities.function_calling) {
    console.log("This model supports function calling");
}

// 查看定價
console.log("Input price:", info.pricing?.input, "/ 1M tokens");
console.log("Output price:", info.pricing?.output, "/ 1M tokens");
```

## 💰 成本計算

```typescript
const [response, error] = await llm.sendMessage("Hello!");

if (response) {
    const cost = llm.calculateCost(response.usage);
    console.log("This request cost:", cost?.amount, cost?.currency);
    console.log("Breakdown:", cost?.breakdown);
}
```

## 🚨 錯誤處理

```typescript
const [response, error] = await llm.sendMessage("Hello");

if (error) {
    switch (error.type) {
        case LLMErrorType.AUTHENTICATION:
            console.log("Invalid API key");
            break;
        case LLMErrorType.RATE_LIMIT:
            console.log(
                "Rate limit exceeded, retry after",
                error.retryAfter,
                "seconds",
            );
            break;
        case LLMErrorType.NETWORK_ERROR:
            if (error.retryable) {
                // 可以重試
            }
            break;
            // ... 其他錯誤類型
    }
}
```

## 📊 對話歷史管理

```typescript
// 獲取歷史
const history = llm.getHistory();

// 設定歷史
llm.setHistory([
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi!" },
]);

// 清空歷史
llm.clearHistory();

// 限制歷史長度 (保留最近 10 條)
llm.limitHistory(10);

// 手動添加到歷史 (不發送請求)
llm.addToHistory({
    role: "user",
    content: "This is added to history only",
});
```

## 🎨 模型特定功能

有些功能只有特定模型支援。使用 `extra` 參數傳遞模型特定的參數:

```typescript
// Grok 的推理功能
const [response, error] = await llm.chat(message, {
    extra: {
        reasoning_effort: "high", // Grok 特定
        search_parameters: { // Grok 特定
            mode: "on",
            return_citations: true,
        },
    },
});

// 推理過程 (只有 Grok 推理模型有)
if (response.reasoning_content) {
    console.log("Reasoning:", response.reasoning_content);
}

// 搜尋引用 (只有啟用搜尋時有)
if (response.citations) {
    console.log("Citations:", response.citations);
}
```

## 🧪 測試

查看 `examples.ts` 獲取更多使用範例。

## 🔮 未來計劃

- [ ] 實作 OpenAI Adapter
- [ ] 實作 Anthropic (Claude) Adapter
- [ ] 實作 Google (Gemini) Adapter
- [ ] 支援 Function Calling
- [ ] 支援 Structured Output
- [ ] 整合 KeyManager 自動管理 API keys
- [ ] 自動重試機制
- [ ] 請求快取
- [ ] 成本追蹤和預算控制
- [ ] 完整的單元測試

## 📝 註解

這個架構的核心理念是 **關注點分離**:

- **聊天控制模組**: 只關心對話邏輯、使用者互動
- **UniversalLLM**: 只關心對話歷史和簡化 API
- **Adapter**: 只關心格式轉換和 API 通訊
- **LLM Provider**: 黑盒子,我們不管內部如何運作

這樣的設計讓每個部分都可以獨立測試、修改和擴展。

## 📄 授權

與專案主體相同。
