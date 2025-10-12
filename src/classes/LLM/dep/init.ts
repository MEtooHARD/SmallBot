/**
 * LLM 模組初始化
 * 
 * 註冊所有可用的 LLM 適配器
 */

import { AdapterFactory } from './_BaseAdapter';
import { GrokAdapter } from './_GrokAdapter';
import { GrokModels } from '../Wrapper';

/**
 * 初始化所有 LLM 適配器
 */
export function initializeLLMAdapters(): void {
    // 註冊 Grok 適配器
    AdapterFactory.register(
        'grok',
        (apiKey: string, modelName: string) => new GrokAdapter(apiKey, modelName),
        [
            'grok-4-0709',
            'grok-4',
            'grok-4-latest',
            'grok-3-mini',
            'grok-3-mini-latest',
            'grok-3-mini-beta',
        ]
    );

    // 未來可以在這裡註冊其他提供者的適配器
    // AdapterFactory.register('openai', 
    //     (apiKey, modelName) => new OpenAIAdapter(apiKey, modelName),
    //     ['gpt-4', 'gpt-3.5-turbo', ...]
    // );
    // AdapterFactory.register('anthropic',
    //     (apiKey, modelName) => new AnthropicAdapter(apiKey, modelName),
    //     ['claude-3-opus', 'claude-3-sonnet', ...]
    // );
}

// 自動初始化
initializeLLMAdapters();
