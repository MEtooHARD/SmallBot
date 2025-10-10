# 遷移指南: 從現有代碼到 Universal LLM 架構

## 📋 遷移概述

這個指南幫助你將現有的 `Chat.ts` 遷移到新的 `UniversalLLM` 架構。

## 🔍 現有代碼分析

### 你現在的 Chat.ts 做了什麼

```typescript
// 現有的 Chat 類別 (簡化版)
class Chat extends Activity {
    protected stack: Chat.MessageStack = [];
    protected model: GrokModel<GrokModelInfo>;

    async onMessage(message: Message<true>): Promise<Report> {
        // 1. 累積訊息
        this.accumulateMessage(message);

        // 2. 生成參數
        const params = this.generateMessageParams();

        // 3. 呼叫 Grok API
        const [res, err] = await this.model.post(this.key, params);

        // 4. 處理回應
        return { success: true };
    }
}
```

### 職責分析

| 職責           | 現有實作                     | 新架構                    |
| -------------- | ---------------------------- | ------------------------- |
| 管理訊息堆疊   | Chat.stack                   | UniversalLLM.history      |
| 生成系統提示詞 | Chat.systemPrompt()          | UniversalLLM.systemPrompt |
| 格式轉換       | Chat.generateMessageParams() | GrokAdapter 自動處理      |
| API 呼叫       | GrokModel.post()             | UniversalLLM.chat()       |
| Discord 互動   | Chat.sendTyping()            | 保留在 Chat               |

## 🎯 遷移策略

### 方案 A: 完全遷移 (推薦)

適合: 想要使用所有新功能,未來可能切換模型

```typescript
import { UniversalLLM, UniversalMessage } from "./classes/LLM";
import { Message } from "discord.js";

class Chat extends Activity {
    private llm: UniversalLLM;

    // 移除這些 (UniversalLLM 會處理):
    // protected stack: Chat.MessageStack = [];
    // protected model: GrokModel<GrokModelInfo>;

    constructor(
        readonly channel: GuildTextBasedChannel,
        readonly key: string,
    ) {
        super();

        // 創建 UniversalLLM 實例
        this.llm = new UniversalLLM({
            model: "grok-4",
            apiKey: key,
            system_prompt: this.buildSystemPrompt(),
            temperature: 1.3,
        });
    }

    async onMessage(message: Message<true>): Promise<Report> {
        if (isSelfMessage(message)) return { success: true };

        // 限制歷史長度
        this.llm.limitHistory(this.maxStack);

        // 發送 typing 指示
        this.sendTyping(message);
        this.status = Chat.Status.THINKING;

        // 準備訊息
        const userMessage: UniversalMessage = {
            role: "user",
            content: message.content,
            name: message.author.displayName,
        };

        // 發送請求
        const startTime = Date.now();
        const [response, error] = await this.llm.chat(userMessage, {
            extra: {
                search_parameters: {
                    mode: "off",
                    return_citations: true,
                },
            },
        });
        const genTime = Date.now() - startTime;

        this.clearTypingInterval();

        if (error) {
            return {
                success: false,
                error: error,
                message: error.message,
            };
        }

        // 發送回應
        const cost = this.llm.calculateCost(response.usage);
        await message.channel.send(
            `-# generation took ${Math.round(genTime / 1000)}s\n` +
                `-# tokens: ${response.usage.total_tokens}\n` +
                `-# cost: $${cost?.amount.toFixed(6)}`,
        );
        await message.channel.send(response.content!);

        this.status = Chat.Status.IDLE;
        return { success: true };
    }

    private buildSystemPrompt(): string {
        return Chat.systemPrompt().content as string;
    }

    // 保留 Discord 相關的方法
    stop(): void {/* ... */}
    clearTypingInterval(): void {/* ... */}
    sendTyping(message: Message<true>): void {/* ... */}

    // 移除這些 (不再需要):
    // protected generateMessageParams(): ...
    // protected accumulateMessage(): ...
    // protected refreshData(): ...
}
```

### 方案 B: 漸進式遷移

適合: 想要保持大部分現有代碼,只使用部分新功能

```typescript
import { UniversalLLM } from './classes/LLM';

class Chat extends Activity {
    // 保留現有的欄位
    protected stack: Chat.MessageStack = [];
    protected model: GrokModel<GrokModelInfo>;
    
    // 新增 UniversalLLM (可選使用)
    private llm?: UniversalLLM;
    
    constructor(...) {
        super();
        this.model = GrokModels.Grok_4_0709;
        
        // 可選: 創建 UniversalLLM 用於某些功能
        this.llm = new UniversalLLM({
            model: 'grok-4',
            apiKey: key,
            system_prompt: Chat.systemPrompt().content as string,
        });
    }
    
    async onMessage(message: Message<true>): Promise<Report> {
        // 使用環境變數或配置決定使用哪個
        if (process.env.USE_UNIVERSAL_LLM === 'true' && this.llm) {
            return this.onMessageUniversal(message);
        } else {
            return this.onMessageOriginal(message);
        }
    }
    
    private async onMessageUniversal(message: Message<true>): Promise<Report> {
        // 使用新架構
        const [response, error] = await this.llm!.chat({
            role: 'user',
            content: message.content,
            name: message.author.displayName,
        });
        // ... 處理回應
    }
    
    private async onMessageOriginal(message: Message<true>): Promise<Report> {
        // 保留原有邏輯
        this.accumulateMessage(message);
        const params = this.generateMessageParams();
        const [res, err] = await this.model.post(this.key, params);
        // ... 處理回應
    }
}
```

### 方案 C: 並行運行 (測試用)

適合: 想要對比測試新舊架構

```typescript
class Chat extends Activity {
    private model: GrokModel<GrokModelInfo>;
    private llm: UniversalLLM;

    async onMessage(message: Message<true>): Promise<Report> {
        // 同時使用兩種方式,對比結果
        const [oldResponse, newResponse] = await Promise.all([
            this.getResponseOld(message),
            this.getResponseNew(message),
        ]);

        // 比較結果
        console.log("Old:", oldResponse?.choices[0].message.content);
        console.log("New:", newResponse?.content);

        // 使用新架構的結果
        if (newResponse) {
            await message.channel.send(newResponse.content!);
        }

        return { success: true };
    }

    private async getResponseOld(message: Message) {
        // 原有邏輯
    }

    private async getResponseNew(message: Message) {
        const [response, error] = await this.llm.chat({
            role: "user",
            content: message.content,
        });
        return response;
    }
}
```

## 🔄 具體遷移步驟

### Step 1: 更新導入

```typescript
// 舊的
import { GrokModel, GrokModels } from "./Wrapper";
import { GrokModelInfo, GrokSupportedMessageParam } from "./types";

// 新的
import { UniversalLLM, UniversalMessage } from "./classes/LLM";
```

### Step 2: 更新構造函數

```typescript
// 舊的
constructor(...) {
    this.model = GrokModels.Grok_4_0709;
}

// 新的
constructor(...) {
    this.llm = new UniversalLLM({
        model: 'grok-4',
        apiKey: key,
        system_prompt: this.buildSystemPrompt(),
        temperature: 1.3,
    });
}
```

### Step 3: 更新訊息處理

```typescript
// 舊的
const params = this.generateMessageParams();
const [res, err] = await this.model.post(this.key, {
    messages: params,
    search_parameters: { mode: "off" },
    stream: false,
});

// 新的
const [response, error] = await this.llm.chat({
    role: "user",
    content: message.content,
    name: message.author.displayName,
}, {
    extra: {
        search_parameters: { mode: "off" },
    },
});
```

### Step 4: 更新回應處理

```typescript
// 舊的
const content = res.choices[0].message.content!;
const tokenCost = GrokModel.extractCost(res.usage);
const cost = GrokModel.calcCost(model.info, tokenCost);

// 新的
const content = response.content!;
const cost = this.llm.calculateCost(response.usage);
```

### Step 5: 移除不需要的方法

```typescript
// 這些方法可以移除 (UniversalLLM 自動處理):
// - generateMessageParams()
// - accumulateMessage()
// - refreshData()
// - replyMessageV1()
// - usersPromptV1()
```

## 🎨 進階功能遷移

### 處理回覆訊息

```typescript
// 舊的
if (item.referredMessage) {
    params.push({
        role: "system",
        content: atUser(item.message.author) +
            " replied to a message: " +
            tag("id", item.referredMessage.id),
    });
}

// 新的
const refMessage = isReply(message)
    ? await message.channel.messages.fetch(message.reference.messageId!)
    : undefined;

if (refMessage) {
    // 手動添加到歷史
    this.llm.addToHistory({
        role: "system",
        content:
            `${message.author.displayName} replied to: ${refMessage.content}`,
    });
}

// 然後發送當前訊息
await this.llm.chat({
    role: "user",
    content: message.content,
    name: message.author.displayName,
});
```

### 使用者資訊

```typescript
// 舊的 - 在 generateMessageParams 中生成
protected usersPromptV1(): GrokSupportedMessageParam {
    return {
        role: 'system',
        content: 'Below are the information about the users...'
    };
}

// 新的 - 在系統提示詞中包含
private buildSystemPrompt(): string {
    return `Your identity in discord: ID: ${client.user?.id}
Display Name: ${client.user?.displayName}

Below are the information about the users in this conversation:
${this.users.map(u => `ID: ${u.id}, DisplayName: ${u.displayName}, Username: ${u.username}`).join('\n')}

You should prefer short and concise responses.`;
}

// 或者動態添加
async onMessage(message: Message) {
    // 更新系統提示詞包含使用者資訊
    const userInfo = this.generateUserInfo();
    this.llm.setSystemPrompt(
        Chat.baseSystemPrompt + '\n\n' + userInfo
    );
    
    // 然後發送訊息
    await this.llm.chat(...);
}
```

### 串流回應

```typescript
// 舊的 - 需要手動處理 SSE
const [response, error] = await this.model.post(this.key, {
    stream: true,
    ...params,
});
// 然後處理 response.body

// 新的 - 簡單的 async generator
const sentMessage = await message.channel.send("Thinking...");
let fullContent = "";

for await (
    const chunk of this.llm.chatStream({
        role: "user",
        content: message.content,
    })
) {
    if (chunk.delta.content) {
        fullContent += chunk.delta.content;
        // 每 2 秒更新一次
        await sentMessage.edit(fullContent + " ▌");
    }
}

// 最終更新
await sentMessage.edit(fullContent);
```

## 📊 對照表

| 功能       | 舊方法                          | 新方法                                |
| ---------- | ------------------------------- | ------------------------------------- |
| 創建實例   | `new Chat(channel, model, key)` | `new UniversalLLM({ model, apiKey })` |
| 發送訊息   | `model.post(key, params)`       | `llm.chat(message)`                   |
| 管理歷史   | `stack.push()`                  | `llm.addToHistory()`                  |
| 限制歷史   | 手動處理                        | `llm.limitHistory(n)`                 |
| 系統提示詞 | 在 messages 中                  | `llm.setSystemPrompt()`               |
| 格式轉換   | `generateMessageParams()`       | 自動處理                              |
| 成本計算   | `GrokModel.calcCost()`          | `llm.calculateCost()`                 |
| 串流       | 手動處理 SSE                    | `llm.chatStream()`                    |
| 錯誤處理   | try-catch                       | `[response, error]`                   |

## ✅ 遷移檢查清單

- [ ] 導入 `UniversalLLM` 和 `UniversalMessage`
- [ ] 創建 `UniversalLLM` 實例替代 `GrokModel`
- [ ] 更新 `onMessage` 使用 `llm.chat()`
- [ ] 移除 `generateMessageParams()` 等格式轉換方法
- [ ] 使用 `llm.limitHistory()` 替代手動管理 stack
- [ ] 更新成本計算使用 `llm.calculateCost()`
- [ ] 測試基本對話功能
- [ ] 測試多輪對話記憶
- [ ] 測試錯誤處理
- [ ] (可選) 實作串流回應
- [ ] (可選) 添加回覆訊息處理
- [ ] 清理不再使用的代碼

## 🧪 測試建議

### 1. 單元測試

```typescript
describe("Chat with UniversalLLM", () => {
    it("should handle basic conversation", async () => {
        const chat = new Chat(channel, apiKey);
        const mockMessage = createMockMessage("Hello");

        const result = await chat.onMessage(mockMessage);
        expect(result.success).toBe(true);
    });

    it("should remember conversation history", async () => {
        const chat = new Chat(channel, apiKey);

        await chat.onMessage(createMockMessage("My name is Alice"));
        const result = await chat.onMessage(
            createMockMessage("What is my name?"),
        );

        expect(result.success).toBe(true);
        // 檢查回應是否包含 "Alice"
    });
});
```

### 2. 整合測試

在開發環境中測試:

1. 基本對話
2. 多輪對話
3. 長對話 (測試歷史限制)
4. 錯誤情況 (無效 API key, 網路錯誤等)
5. 串流回應 (如果實作)

## 🚀 上線計劃

### 階段 1: 並行測試 (1-2 週)

- 同時運行新舊架構
- 收集數據和反饋
- 修復發現的問題

### 階段 2: 灰度發布 (1 週)

- 部分頻道使用新架構
- 監控錯誤率和性能
- 收集使用者反饋

### 階段 3: 全面遷移

- 所有頻道切換到新架構
- 移除舊代碼
- 更新文檔

## 💡 最佳實踐

1. **保持簡單**: 先遷移基本功能,進階功能慢慢加
2. **測試充分**: 每個功能都要測試
3. **保留備份**: 遷移前備份舊代碼
4. **監控錯誤**: 使用錯誤處理和日誌
5. **文檔更新**: 更新相關文檔和註釋

## 🆘 常見問題

### Q: 遷移後性能會變差嗎?

A: 不會。新架構只是多了一層抽象,實際 API 呼叫是一樣的。

### Q: 能同時支援多個模型嗎?

A: 可以!這正是新架構的優勢。只需創建多個 `UniversalLLM` 實例。

### Q: 舊代碼能保留嗎?

A: 可以。新架構不影響舊代碼,可以並行運行。

### Q: 如何處理 Grok 特定的功能?

A: 使用 `extra` 參數:

```typescript
await llm.chat(message, {
    extra: {
        reasoning_effort: 'high',  // Grok 特定
        search_parameters: {...},   // Grok 特定
    },
});
```

## 📞 需要幫助?

- 查看 `examples.ts` 獲取更多範例
- 閱讀 `QUICKREF.md` 快速參考
- 查看 `README.md` 完整文檔

祝遷移順利! 🎉
