/**
 * UniversalLLM 使用範例
 * 
 * 展示如何使用新的通用 LLM 架構
 */

import { UniversalLLM } from './UniversalLLM';
import { UniversalMessage } from './UniversalTypes';
import './init'; // 確保適配器已註冊

// ==================== 範例 1: 簡單對話 ====================
async function example1_SimpleChat() {
    // 創建 LLM 實例
    const llm = UniversalLLM.create(
        'grok-4', // 模型名稱
        'your-api-key-here',
        'You are a helpful assistant.' // 系統提示詞
    );

    // 發送訊息
    const [response, error] = await llm.sendMessage('Hello! How are you?');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Assistant:', response);
}

// ==================== 範例 2: 多輪對話 ====================
async function example2_MultiTurnChat() {
    const llm = new UniversalLLM({
        model: 'grok-4',
        apiKey: 'your-api-key-here',
        system_prompt: 'You are a helpful assistant.',
        temperature: 0.8,
        max_tokens: 1000,
    });

    // 第一輪
    await llm.sendMessage('My name is Alice.');

    // 第二輪 (模型會記住你的名字)
    const [response, error] = await llm.sendMessage('What is my name?');
    console.log('Assistant:', response); // 應該會說 "Alice"

    // 查看對話歷史
    console.log('History:', llm.getHistory());
}

// ==================== 範例 3: 使用串流 ====================
async function example3_StreamChat() {
    const llm = UniversalLLM.create('grok-4', 'your-api-key-here');

    const message: UniversalMessage = {
        role: 'user',
        content: 'Tell me a story in 3 sentences.',
    };

    console.log('Assistant: ');
    try {
        for await (const chunk of llm.chatStream(message)) {
            if (chunk.delta.content) {
                process.stdout.write(chunk.delta.content);
            }

            // 在最後一個 chunk 可以取得使用統計
            if (chunk.finish_reason && chunk.usage) {
                console.log('\n\nUsage:', chunk.usage);

                // 計算成本
                const cost = llm.calculateCost(chunk.usage);
                if (cost) {
                    console.log('Cost:', cost);
                }
            }
        }
    } catch (error) {
        console.error('Stream error:', error);
    }
}

// ==================== 範例 4: 多模態輸入 (圖片) ====================
async function example4_ImageInput() {
    const llm = UniversalLLM.create('grok-4', 'your-api-key-here');

    // 檢查模型是否支援圖片輸入
    if (!llm.supports('image_input')) {
        console.log('This model does not support image input');
        return;
    }

    const message: UniversalMessage = {
        role: 'user',
        content: [
            {
                type: 'text',
                text: 'What do you see in this image?',
            },
            {
                type: 'image',
                mime_type: 'image/jpeg',
                data: 'base64-encoded-image-data-here',
                detail: 'high',
            },
        ],
    };

    const [response, error] = await llm.chat(message);
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Assistant:', response.content);
}

// ==================== 範例 5: Discord Bot 整合 ====================
async function example5_DiscordBot() {
    // 模擬 Discord 訊息處理
    const llm = new UniversalLLM({
        model: 'grok-4',
        apiKey: 'your-api-key-here',
        system_prompt: 'You are a Discord bot assistant. Keep responses concise.',
        temperature: 1.3,
    });

    // 處理使用者訊息
    async function handleDiscordMessage(
        userId: string,
        username: string,
        content: string
    ) {
        const message: UniversalMessage = {
            role: 'user',
            content: content,
            name: username, // Discord 使用者名稱
        };

        const [response, error] = await llm.chat(message);

        if (error) {
            console.error('Error:', error.message);
            return 'Sorry, something went wrong.';
        }

        return response.content || 'No response';
    }

    // 使用
    const reply = await handleDiscordMessage('123456', 'Alice', 'Hello bot!');
    console.log('Bot reply:', reply);
}

// ==================== 範例 6: 管理對話歷史 ====================
async function example6_HistoryManagement() {
    const llm = UniversalLLM.create('grok-4', 'your-api-key-here');

    // 發送一些訊息
    await llm.sendMessage('My favorite color is blue.');
    await llm.sendMessage('I love programming.');
    await llm.sendMessage('My hobby is reading.');

    console.log('Current history length:', llm.getHistory().length);

    // 限制歷史長度 (只保留最近 2 條)
    llm.limitHistory(2);
    console.log('After limiting:', llm.getHistory().length);

    // 清空歷史
    llm.clearHistory();
    console.log('After clearing:', llm.getHistory().length);

    // 手動設定歷史
    const customHistory: UniversalMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
    ];
    llm.setHistory(customHistory);
}

// ==================== 範例 7: 檢查模型能力 ====================
async function example7_ModelCapabilities() {
    const llm = UniversalLLM.create('grok-4', 'your-api-key-here');

    const info = llm.getModelInfo();
    console.log('Model:', info.name);
    console.log('Provider:', info.provider);
    console.log('Capabilities:');
    console.log('  - Text input:', info.capabilities.text_input);
    console.log('  - Image input:', info.capabilities.image_input);
    console.log('  - Function calling:', info.capabilities.function_calling);
    console.log('  - Streaming:', info.capabilities.streaming);
    console.log('  - Reasoning:', info.capabilities.reasoning);
    console.log('  - Web search:', info.capabilities.web_search);
    console.log('  - Max context:', info.capabilities.max_context_length);

    if (info.pricing) {
        console.log('Pricing (per 1M tokens):');
        console.log('  - Input: $', info.pricing.input);
        console.log('  - Output: $', info.pricing.output);
    }
}

// ==================== 範例 8: 錯誤處理 ====================
async function example8_ErrorHandling() {
    const llm = UniversalLLM.create('grok-4', 'invalid-api-key');

    const [response, error] = await llm.sendMessage('Hello');

    if (error) {
        console.log('Error type:', error.type);
        console.log('Error message:', error.message);
        console.log('Is retryable:', error.retryable);

        if (error.retryAfter) {
            console.log('Retry after (seconds):', error.retryAfter);
        }

        // 根據錯誤類型處理
        switch (error.type) {
            case 'authentication':
                console.log('Please check your API key');
                break;
            case 'rate_limit':
                console.log('Rate limit exceeded, please wait');
                break;
            case 'network_error':
                console.log('Network error, retrying...');
                break;
            default:
                console.log('Unknown error');
        }
    }
}

// ==================== 範例 9: 使用推理模型特性 ====================
async function example9_ReasoningModel() {
    const llm = new UniversalLLM({
        model: 'grok-3-mini', // 支援 reasoning
        apiKey: 'your-api-key-here',
        // 使用 extra 傳遞模型特定參數
    });

    const message: UniversalMessage = {
        role: 'user',
        content: 'Solve this problem step by step: If a train travels 120 km in 2 hours, what is its average speed?',
    };

    const [response, error] = await llm.chat(message, {
        extra: {
            reasoning_effort: 'high', // Grok 特定參數
        },
    });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Content:', response.content);

    // Grok 推理模型會有推理過程
    if (response.reasoning_content) {
        console.log('\nReasoning process:', response.reasoning_content);
    }

    console.log('\nUsage:', response.usage);
}

// ==================== 範例 10: 搭配你現有的 Chat 類別 ====================
/**
 * 將現有的 Chat 類別遷移到新架構的範例
 */
class NewChat {
    private llm: UniversalLLM;
    private maxStackSize: number = 10;

    constructor(model: string, apiKey: string) {
        this.llm = new UniversalLLM({
            model: model,
            apiKey: apiKey,
            system_prompt: this.buildSystemPrompt(),
            temperature: 1.3,
        });
    }

    async onMessage(userId: string, username: string, content: string): Promise<string> {
        // 限制歷史長度
        this.llm.limitHistory(this.maxStackSize);

        // 發送訊息
        const message: UniversalMessage = {
            role: 'user',
            content: content,
            name: username,
        };

        const [response, error] = await this.llm.chat(message);

        if (error) {
            console.error('Chat error:', error);
            return 'Sorry, I encountered an error.';
        }

        return response.content || 'No response';
    }

    async *onMessageStream(
        userId: string,
        username: string,
        content: string
    ): AsyncGenerator<string, void, unknown> {
        this.llm.limitHistory(this.maxStackSize);

        const message: UniversalMessage = {
            role: 'user',
            content: content,
            name: username,
        };

        for await (const chunk of this.llm.chatStream(message)) {
            if (chunk.delta.content) {
                yield chunk.delta.content;
            }
        }
    }

    private buildSystemPrompt(): string {
        return 'You are a helpful Discord bot. Keep responses short and concise.';
    }

    getHistory() {
        return this.llm.getHistory();
    }

    clearHistory() {
        this.llm.clearHistory();
    }
}

// 導出所有範例
export {
    example1_SimpleChat,
    example2_MultiTurnChat,
    example3_StreamChat,
    example4_ImageInput,
    example5_DiscordBot,
    example6_HistoryManagement,
    example7_ModelCapabilities,
    example8_ErrorHandling,
    example9_ReasoningModel,
    NewChat,
};
