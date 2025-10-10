# Universal LLM 架構 - 視覺總覽

## 整體架構

```
┌───────────────────────────────────────────────────────────────────┐
│                        Discord Bot 應用層                          │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Chat.ts     │  │ Commands    │  │ Features    │              │
│  │ 聊天管理     │  │ 指令處理     │  │ 功能模組     │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
└─────────┼────────────────┼────────────────┼──────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                           │ 使用簡單 API
                           ↓
┌───────────────────────────────────────────────────────────────────┐
│                     UniversalLLM 統一管理器                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • sendMessage(text)          - 簡單文字聊天              │   │
│  │  • chat(messages, options)    - 完整控制                  │   │
│  │  • chatStream(messages)       - 串流回應                  │   │
│  │  • getHistory() / setHistory() - 對話歷史管理             │   │
│  │  • limitHistory(n)            - 限制歷史長度               │   │
│  │  • getModelInfo()             - 模型資訊                   │   │
│  │  • calculateCost()            - 成本計算                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ 委託給適配器
                             ↓
┌───────────────────────────────────────────────────────────────────┐
│                      LLMAdapter 適配器層                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • chat()              - 格式轉換並呼叫 API               │   │
│  │  • chatStream()        - 串流處理                         │   │
│  │  • calculateCost()     - 成本計算                         │   │
│  │  • validateRequest()   - 驗證請求                         │   │
│  │  • toProviderFormat()  - Universal → Provider             │   │
│  │  • fromProviderFormat() - Provider → Universal            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────┬────────────┬────────────┬─────────────────────────────┘
             │            │            │
             ↓            ↓            ↓
┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
│  GrokAdapter    │ │ OpenAIAdapter│ │ClaudeAdapter │
│  ✅ 已實作       │ │ ⏳ 計劃中     │ │ ⏳ 計劃中     │
└────────┬────────┘ └──────┬──────┘ └──────┬───────┘
         │                 │                │
         ↓                 ↓                ↓
┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
│   Grok API      │ │ OpenAI API  │ │ Anthropic API│
│  (x.ai)         │ │ (openai.com)│ │(anthropic.com)│
└─────────────────┘ └─────────────┘ └──────────────┘
```

## 資料流 - 發送訊息

```
1️⃣ 使用者輸入
   ↓
2️⃣ Discord Bot 接收
   message.content = "Hello!"
   ↓
3️⃣ 呼叫 UniversalLLM
   await llm.sendMessage("Hello!")
   ↓
4️⃣ UniversalLLM 建立請求
   {
     messages: [
       { role: 'system', content: 'System prompt...' },
       ...history,
       { role: 'user', content: 'Hello!' }
     ],
     temperature: 0.8,
     ...
   }
   ↓
5️⃣ 委託給 Adapter
   adapter.chat(request)
   ↓
6️⃣ Adapter 驗證能力
   ✓ 檢查是否支援 image_input
   ✓ 檢查是否支援 streaming
   ↓
7️⃣ 格式轉換 (Universal → Grok)
   UniversalMessage → GrokMessage
   ↓
8️⃣ HTTP 請求到 Grok API
   POST https://api.x.ai/v1/chat/completions
   ↓
9️⃣ 收到回應
   GrokChatCompletion { choices: [...], usage: {...} }
   ↓
🔟 格式轉換 (Grok → Universal)
   GrokChatCompletion → UniversalChatResponse
   ↓
1️⃣1️⃣ UniversalLLM 更新歷史
   history.push(userMessage, assistantMessage)
   ↓
1️⃣2️⃣ 返回給 Discord Bot
   [response, null]
   ↓
1️⃣3️⃣ Discord Bot 發送訊息
   channel.send(response.content)
```

## 類型系統 - 層級對應

```
┌─────────────────────────────────────────────────────────────┐
│                       Universal 類型                         │
│  (所有提供者的共同抽象)                                        │
├─────────────────────────────────────────────────────────────┤
│  • UniversalMessage                                         │
│  • UniversalChatRequest                                     │
│  • UniversalChatResponse                                    │
│  • UniversalContentPart                                     │
│  • UniversalToolCall                                        │
│  • UniversalCost                                            │
│  • ModelInfo                                                │
└─────────────────────────────────────────────────────────────┘
                           ↕ 轉換
┌─────────────────────────────────────────────────────────────┐
│                    Provider 特定類型                          │
│  (各家 API 的原生格式)                                         │
├──────────────┬──────────────────┬───────────────────────────┤
│ Grok 類型    │ OpenAI 類型       │ Claude 類型                │
├──────────────┼──────────────────┼───────────────────────────┤
│ GrokMessage  │ ChatCompletionMsg│ ClaudeMessage             │
│ GrokParams   │ ChatCompletionReq│ ClaudeRequest             │
│ GrokResponse │ ChatCompletion   │ ClaudeResponse            │
└──────────────┴──────────────────┴───────────────────────────┘
```

## 核心組件關係

```
┌──────────────────┐
│  UniversalLLM    │  主要入口,提供高階 API
└────────┬─────────┘
         │ has-a
         ↓
┌──────────────────┐
│   LLMAdapter     │  抽象基類
└────────┬─────────┘
         │ is-a
         ↓
┌──────────────────┐
│  GrokAdapter     │  具體實作
└────────┬─────────┘
         │ uses
         ↓
┌──────────────────┐
│   GrokModel      │  原有的 Grok 封裝
└──────────────────┘
```

## 錯誤處理流程

```
                    ┌─────────────┐
                    │ 發送請求     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  成功?       │
                    └──┬───────┬───┘
                      YES      NO
                       │       │
              ┌────────▼──┐   │
              │ 返回結果   │   │
              │ [res, null]│   │
              └────────────┘   │
                               │
                      ┌────────▼───────┐
                      │ 識別錯誤類型    │
                      └────────┬───────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
│ AUTHENTICATION │  │   RATE_LIMIT     │  │ NETWORK_ERROR    │
│ 不可重試        │  │   可重試          │  │  可重試           │
└───────┬────────┘  └─────────┬────────┘  └─────────┬────────┘
        │                     │                      │
        ↓                     ↓                      ↓
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ 返回錯誤      │   │ 等待後重試       │   │ 立即重試         │
│[null, error]  │   │ (retryAfter)    │   │                 │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

## 適配器工廠模式

```
┌─────────────────────────────────────────────────────────┐
│              AdapterFactory (單例)                       │
├─────────────────────────────────────────────────────────┤
│  private factories: Map<Provider, FactoryFunction>     │
│  private modelMapping: Map<Alias, Provider>            │
├─────────────────────────────────────────────────────────┤
│  + register(provider, factory, aliases)                │
│  + create(modelName, apiKey): LLMAdapter               │
│  + listModels(): string[]                              │
│  + listProviders(): string[]                           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 管理
                           ↓
┌───────────────────────────────────────────────────────────┐
│                    註冊的適配器                            │
├──────────────┬──────────────────┬─────────────────────────┤
│ 'grok'       │ 'openai'         │ 'anthropic'             │
│ → GrokAdapter│ → OpenAIAdapter  │ → ClaudeAdapter         │
├──────────────┼──────────────────┼─────────────────────────┤
│ Aliases:     │ Aliases:         │ Aliases:                │
│ • grok-4     │ • gpt-4          │ • claude-3-opus         │
│ • grok-3-mini│ • gpt-3.5-turbo  │ • claude-3-sonnet       │
└──────────────┴──────────────────┴─────────────────────────┘

使用範例:
const adapter = AdapterFactory.create('grok-4', apiKey);
                                      ↓
                           查找 'grok-4' → 'grok'
                                      ↓
                           調用 grok 的工廠函數
                                      ↓
                           返回 GrokAdapter 實例
```

## 串流處理流程

```
開始串流請求
    ↓
┌────────────────────────┐
│ adapter.chatStream()   │
└───────────┬────────────┘
            │
            ↓ (返回 AsyncGenerator)
┌────────────────────────┐
│ 接收 SSE 事件流         │
│ data: {...chunk1...}   │
│ data: {...chunk2...}   │
│ data: {...chunk3...}   │
│ data: [DONE]           │
└───────────┬────────────┘
            │
            ↓ (解析 + 轉換)
┌────────────────────────┐
│ yield UniversalChunk   │
│ { delta: { content }}  │
└───────────┬────────────┘
            │
            ↓ (應用層消費)
┌────────────────────────┐
│ for await (const chunk)│
│   print(chunk.content) │
└────────────────────────┘
```

## 對話歷史管理

```
                    UniversalLLM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
┌──────────────┐  ┌─────────────┐  ┌────────────┐
│ systemPrompt │  │  history[]  │  │ newMessage │
└──────────────┘  └─────────────┘  └────────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                         ↓ buildMessageList()
              ┌──────────────────────┐
              │ 完整的 messages 陣列  │
              │ [system, ...history, │
              │  ...newMessages]     │
              └──────────┬───────────┘
                         │
                         ↓ 發送到 API
                   
                   收到回應後
                         │
                         ↓ 更新歷史
              ┌──────────────────────┐
              │ history.push(        │
              │   userMessage,       │
              │   assistantMessage   │
              │ )                    │
              └──────────────────────┘
                         │
                         ↓ 如果太長
              ┌──────────────────────┐
              │ limitHistory(10)     │
              │ → 只保留最近 10 條    │
              └──────────────────────┘
```

## 模型能力檢查

```
創建 LLM 實例
    ↓
┌────────────────────────┐
│ adapter.getModelInfo() │
└───────────┬────────────┘
            │
            ↓
┌────────────────────────────────────┐
│ ModelInfo {                        │
│   capabilities: {                  │
│     text_input: true,    ✅         │
│     image_input: true,   ✅         │
│     audio_input: false,  ❌         │
│     function_calling: true,  ✅     │
│     streaming: true,     ✅         │
│     reasoning: true,     ✅         │
│     ...                            │
│   }                                │
│ }                                  │
└───────────┬────────────────────────┘
            │
            ↓ 發送請求前
┌────────────────────────────────────┐
│ validateRequest()                  │
│                                    │
│ if (request.tools &&               │
│     !caps.function_calling) {      │
│   throw Error('Not supported')     │
│ }                                  │
│                                    │
│ if (hasImage &&                    │
│     !caps.image_input) {           │
│   throw Error('No image support')  │
│ }                                  │
└────────────────────────────────────┘
```

## 成本計算

```
收到回應
    ↓
┌────────────────────────────────┐
│ response.usage {               │
│   prompt_tokens: 1000,         │
│   completion_tokens: 500,      │
│   cached_tokens: 200           │
│ }                              │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ adapter.calculateCost(usage)   │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ UniversalCost {                │
│   currency: 'USD',             │
│   amount: 0.002375,            │
│   breakdown: {                 │
│     input_cost: 0.00075,       │
│     output_cost: 0.001575,     │
│     cached_cost: 0.00005       │
│   }                            │
│ }                              │
└────────────────────────────────┘
```

## 檔案組織

```
src/classes/LLM/
│
├── 📄 核心類型
│   └── UniversalTypes.ts         統一的類型定義
│
├── 🏗️ 基礎架構
│   ├── BaseAdapter.ts            適配器基類 + 工廠
│   └── UniversalLLM.ts           統一管理器 (主要 API)
│
├── 🔌 適配器實作
│   ├── GrokAdapter.ts            ✅ Grok 適配器
│   ├── OpenAIAdapter.ts          ⏳ 計劃中
│   └── ClaudeAdapter.ts          ⏳ 計劃中
│
├── ⚙️ 初始化
│   ├── init.ts                   註冊所有適配器
│   └── index.ts                  模組入口
│
├── 📚 文檔
│   ├── README.md                 完整文檔
│   ├── ARCHITECTURE.md           架構設計
│   ├── QUICKREF.md               快速參考
│   └── DIAGRAMS.md               本文件 (視覺總覽)
│
├── 💡 範例
│   └── examples.ts               使用範例
│
└── 🧪 原有代碼 (保留相容)
    ├── types.ts                  Grok 特定類型
    ├── Wrapper.ts                GrokModel 類別
    ├── Chat.ts                   原有的 Chat 類別
    └── ...                       其他檔案
```

## 使用流程圖

```
開發者想使用 LLM
        │
        ↓
   決定使用情境
        │
   ┌────┴────┐
   │         │
   ↓         ↓
簡單聊天   複雜應用
   │         │
   ↓         ↓
   
【簡單聊天】
const llm = UniversalLLM.create('grok-4', apiKey);
const [response, error] = await llm.sendMessage('Hello!');
if (error) handle(error);
console.log(response);

【複雜應用】
1. 創建 LLM 實例
   const llm = new UniversalLLM({
     model: 'grok-4',
     apiKey: apiKey,
     system_prompt: '...',
     temperature: 0.8,
   });

2. 管理對話
   llm.setHistory([...]);
   llm.limitHistory(10);

3. 發送訊息
   const [response, error] = await llm.chat({
     role: 'user',
     content: [...],  // 支援多模態
     name: 'Alice',
   }, {
     extra: { reasoning_effort: 'high' }
   });

4. 處理回應
   if (error) {
     if (error.retryable) retry();
     else handle(error);
   } else {
     use(response.content);
     log(response.reasoning_content);
     track(llm.calculateCost(response.usage));
   }
```

---

這個視覺總覽幫助你快速理解整個架構的設計和運作方式! 🎨
