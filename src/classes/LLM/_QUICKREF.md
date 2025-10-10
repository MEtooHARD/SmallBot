# Universal LLM - 快速參考

## 📦 安裝/導入

```typescript
import { UniversalLLM } from "./classes/LLM";
// 或
import { UniversalLLM } from "./classes/LLM/UniversalLLM";
import "./classes/LLM/init"; // 如果分開導入,記得初始化
```

## 🚀 快速開始

```typescript
// 最簡單的方式
const llm = UniversalLLM.create("grok-4", "your-api-key");
const [response, error] = await llm.sendMessage("Hello!");
```

## 📚 常用 API

### 創建實例

```typescript
// 方式 1: 工廠方法
const llm = UniversalLLM.create(
    "grok-4", // 模型名稱
    "api-key", // API key
    "System prompt", // 可選: 系統提示詞
);

// 方式 2: 構造函數
const llm = new UniversalLLM({
    model: "grok-4",
    apiKey: "your-api-key",
    system_prompt: "You are...",
    temperature: 0.8,
    max_tokens: 1000,
});

// 方式 3: 帶歷史記錄
const llm = UniversalLLM.createWithHistory(
    "grok-4",
    existingHistory, // UniversalMessage[]
    "api-key",
    "System prompt",
);
```

### 發送訊息

```typescript
// 簡單文字
const [response, error] = await llm.sendMessage("Hello!");

// 完整控制
const [response, error] = await llm.chat({
    role: "user",
    content: "Hello!",
    name: "Alice", // 可選
});

// 多條訊息
const [response, error] = await llm.chat([
    { role: "user", content: "Message 1" },
    { role: "user", content: "Message 2" },
]);

// 帶選項
const [response, error] = await llm.chat(message, {
    temperature: 0.5,
    max_tokens: 500,
});
```

### 串流回應

```typescript
for await (const chunk of llm.chatStream(message)) {
    if (chunk.delta.content) {
        console.log(chunk.delta.content);
    }

    if (chunk.finish_reason) {
        console.log("Done:", chunk.finish_reason);
    }

    if (chunk.usage) {
        console.log("Usage:", chunk.usage);
    }
}
```

### 對話歷史

```typescript
// 獲取歷史
const history = llm.getHistory();

// 設定歷史
llm.setHistory([...]);

// 清空歷史
llm.clearHistory();

// 限制長度 (保留最近 N 條)
llm.limitHistory(10);

// 手動添加 (不發送請求)
llm.addToHistory({ role: 'user', content: '...' });
```

### 系統提示詞

```typescript
// 設定
llm.setSystemPrompt("You are a helpful assistant.");

// 獲取
const prompt = llm.getSystemPrompt();
```

### 模型資訊

```typescript
// 獲取完整資訊
const info = llm.getModelInfo();
console.log(info.name);
console.log(info.capabilities);

// 檢查特定能力
if (llm.supports("image_input")) {
    // 可以發送圖片
}

// 計算成本
const cost = llm.calculateCost(response.usage);
console.log(cost?.amount, cost?.currency);
```

## 📝 訊息格式

### 基本文字訊息

```typescript
const message = {
    role: "user",
    content: "Hello!",
};
```

### 多模態訊息 (圖片)

```typescript
const message = {
    role: "user",
    content: [
        { type: "text", text: "What is this?" },
        {
            type: "image",
            mime_type: "image/jpeg",
            data: "base64-string",
            detail: "high", // 可選
        },
    ],
};
```

### 帶名稱的訊息

```typescript
const message = {
    role: "user",
    content: "Hello!",
    name: "Alice", // Discord 使用者名稱
};
```

## 🎛️ 請求選項

```typescript
const options = {
    temperature: 0.8,        // 0-2, 創造性
    max_tokens: 1000,        // 最大輸出長度
    top_p: 0.9,             // nucleus sampling
    stop: ['\n', 'END'],    // 停止序列
    stream: true,            // 串流回應
    
    // 模型特定參數
    extra: {
        reasoning_effort: 'high',     // Grok
        search_parameters: {...},      // Grok
    },
};

await llm.chat(message, options);
```

## 🔍 回應格式

```typescript
const [response, error] = await llm.chat(message);

if (response) {
    response.id; // 請求 ID
    response.model; // 使用的模型
    response.content; // 回應文字
    response.finish_reason; // 'stop', 'length', ...

    response.usage.prompt_tokens;
    response.usage.completion_tokens;
    response.usage.total_tokens;

    // 可選欄位
    response.reasoning_content; // Grok 推理過程
    response.citations; // 搜尋引用
    response.tool_calls; // Function calling
}
```

## 🚨 錯誤處理

```typescript
const [response, error] = await llm.sendMessage("Hello");

if (error) {
    // 錯誤類型
    switch (error.type) {
        case "authentication":
            console.log("Invalid API key");
            break;
        case "rate_limit":
            console.log("Rate limit, retry after", error.retryAfter, "s");
            break;
        case "network_error":
            if (error.retryable) {
                // 可以重試
            }
            break;
    }

    // 錯誤訊息
    console.log(error.message);
}
```

## 🎨 常見模式

### Discord Bot 整合

```typescript
class ChatManager {
    private llms = new Map<string, UniversalLLM>();

    getLLM(channelId: string): UniversalLLM {
        if (!this.llms.has(channelId)) {
            this.llms.set(
                channelId,
                UniversalLLM.create(
                    "grok-4",
                    process.env.GROK_API_KEY!,
                    "You are a Discord bot.",
                ),
            );
        }
        return this.llms.get(channelId)!;
    }

    async handleMessage(channelId: string, username: string, content: string) {
        const llm = this.getLLM(channelId);

        // 限制歷史
        llm.limitHistory(10);

        // 發送訊息
        const [response, error] = await llm.chat({
            role: "user",
            content: content,
            name: username,
        });

        if (error) {
            return "Sorry, something went wrong.";
        }

        return response.content || "No response";
    }
}
```

### 串流到 Discord

```typescript
async function streamToDiscord(
    llm: UniversalLLM,
    message: UniversalMessage,
    discordMessage: Message,
) {
    let fullContent = "";
    let lastUpdate = Date.now();

    for await (const chunk of llm.chatStream(message)) {
        if (chunk.delta.content) {
            fullContent += chunk.delta.content;

            // 每 2 秒更新一次
            if (Date.now() - lastUpdate > 2000) {
                await discordMessage.edit(fullContent + " ▌");
                lastUpdate = Date.now();
            }
        }
    }

    // 最終更新
    await discordMessage.edit(fullContent);
}
```

### 智能歷史管理

```typescript
async function smartHistoryLimit(llm: UniversalLLM) {
    const history = llm.getHistory();

    if (history.length > 20) {
        // 摘要前面的訊息
        const oldMessages = history.slice(0, -10);
        const summaryLLM = UniversalLLM.create("grok-4", apiKey);

        const [summary] = await summaryLLM.sendMessage(
            "Summarize this conversation:\n" +
                oldMessages.map((m) => `${m.role}: ${m.content}`).join("\n"),
        );

        // 保留摘要 + 最近訊息
        llm.setHistory([
            {
                role: "system",
                content: `Previous conversation summary: ${summary}`,
            },
            ...history.slice(-10),
        ]);
    }
}
```

## 🔧 除錯技巧

```typescript
// 查看原始請求
const [response, error] = await llm.chat(message);
console.log("Raw response:", response.raw);

// 查看對話歷史
console.log("History:", JSON.stringify(llm.getHistory(), null, 2));

// 查看 token 使用
console.log("Tokens used:", response.usage);
console.log("Cost:", llm.calculateCost(response.usage));

// 查看模型資訊
console.log("Model:", llm.getModelInfo());
```

## 📊 支援的模型

| 提供者    | 模型名稱                           | 狀態      |
| --------- | ---------------------------------- | --------- |
| Grok      | `grok-4`, `grok-4-0709`            | ✅ 支援   |
| Grok      | `grok-3-mini`                      | ✅ 支援   |
| OpenAI    | `gpt-4`, `gpt-3.5-turbo`           | ⏳ 計劃中 |
| Anthropic | `claude-3-opus`, `claude-3-sonnet` | ⏳ 計劃中 |
| Google    | `gemini-pro`                       | ⏳ 計劃中 |

## 🔗 相關文件

- [README.md](./README.md) - 完整文檔
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架構設計
- [examples.ts](./examples.ts) - 更多範例

## 💡 提示

1. 總是檢查錯誤: `if (error) { ... }`
2. 使用 `limitHistory()` 避免 token 爆炸
3. 串流適合長回應,非串流適合短回應
4. 使用 `extra` 參數傳遞模型特定功能
5. 查看 `response.raw` 獲得原始回應用於除錯
