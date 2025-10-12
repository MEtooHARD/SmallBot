/**
 * LLM 適配器基類
 * 
 * 每個 LLM 服務 (Grok, OpenAI, Anthropic, etc.) 都需要實作一個適配器
 * 適配器負責:
 * 1. 將標準格式轉換為該服務的 API 格式
 * 2. 將該服務的回應轉換回標準格式
 * 3. 處理該服務特有的功能和限制
 */

import { Result } from '../../Basic/GeneralTypes';
import {
    UniversalChatRequest,
    UniversalChatResponse,
    UniversalChatChunk,
    UniversalCost,
    ModelInfo,
    LLMError,
} from './_UniversalTypes';

export abstract class LLMAdapter {
    constructor(
        protected apiKey: string,
        public readonly modelInfo: ModelInfo
    ) { }

    /**
     * 發送聊天請求 (非串流)
     */
    abstract chat(
        request: UniversalChatRequest
    ): Promise<Result<UniversalChatResponse, LLMError>>;

    /**
     * 發送聊天請求 (串流)
     * 返回一個 async generator
     */
    abstract chatStream(
        request: UniversalChatRequest
    ): AsyncGenerator<UniversalChatChunk, void, unknown>;

    /**
     * 計算這次請求的成本
     */
    abstract calculateCost(
        usage: UniversalChatResponse['usage']
    ): UniversalCost | null;

    /**
     * 檢查請求是否符合模型能力
     * 如果不符合會拋出錯誤或自動調整
     */
    protected validateRequest(request: UniversalChatRequest): void {
        const caps = this.modelInfo.capabilities;

        // 檢查圖片輸入
        if (!caps.image_input) {
            for (const msg of request.messages) {
                if (Array.isArray(msg.content)) {
                    if (msg.content.some(part => part.type === 'image')) {
                        throw new Error(
                            `Model ${this.modelInfo.name} does not support image input`
                        );
                    }
                }
            }
        }

        // 檢查 function calling
        if (request.tools && !caps.function_calling) {
            throw new Error(
                `Model ${this.modelInfo.name} does not support function calling`
            );
        }

        // 檢查串流
        if (request.stream && !caps.streaming) {
            throw new Error(
                `Model ${this.modelInfo.name} does not support streaming`
            );
        }

        // 可以添加更多檢查...
    }

    /**
     * 輔助方法: 計算訊息中的 token 數 (粗略估計)
     * 各個適配器可以覆寫這個方法使用更精確的計算
     */
    // abstract estimateTokens(text: string): number;

    /**
     * 取得模型資訊
     */
    getModelInfo(): ModelInfo {
        return this.modelInfo;
    }

    /**
     * 檢查是否支援某個功能
     */
    supports(capability: keyof ModelInfo['capabilities']): boolean | number {
        return this.modelInfo.capabilities[capability];
    }
}

/**
 * 適配器工廠函數類型
 */
export type AdapterFactoryFunction = (apiKey: string, modelName: string) => LLMAdapter;

/**
 * 適配器工廠
 * 用於根據模型名稱創建對應的適配器
 */
export class AdapterFactory {
    private static factories = new Map<string, AdapterFactoryFunction>();
    private static modelMapping = new Map<string, string>(); // alias -> provider

    /**
     * 註冊一個適配器
     */
    static register(
        provider: string,
        factoryFunction: AdapterFactoryFunction,
        modelAliases: string[]
    ): void {
        this.factories.set(provider, factoryFunction);
        for (const alias of modelAliases) {
            this.modelMapping.set(alias.toLowerCase(), provider);
        }
    }

    /**
     * 創建適配器實例
     */
    static create(
        modelNameOrAlias: string,
        apiKey: string
    ): LLMAdapter {
        const provider = this.modelMapping.get(modelNameOrAlias.toLowerCase());

        if (!provider) {
            throw new Error(`Unknown model: ${modelNameOrAlias}`);
        }

        const factory = this.factories.get(provider);
        if (!factory) {
            throw new Error(`Adapter factory not found for provider: ${provider}`);
        }

        return factory(apiKey, modelNameOrAlias);
    }

    /**
     * 列出所有支援的模型
     */
    static listModels(): string[] {
        return Array.from(this.modelMapping.keys());
    }

    /**
     * 列出所有支援的提供者
     */
    static listProviders(): string[] {
        return Array.from(this.factories.keys());
    }
}
