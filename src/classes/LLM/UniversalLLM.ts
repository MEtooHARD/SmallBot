/**
 * 統一的 LLM 管理器
 * 
 * 這是聊天控制模組使用的主要介面
 * 負責:
 * 1. 管理不同的 LLM 適配器
 * 2. 提供簡單的 API 給聊天模組
 * 3. 處理 API key 管理
 * 4. 記錄和統計
 */

import { Result } from '../Basic/GeneralTypes';
import { LLMAdapter, AdapterFactory } from './BaseAdapter';
import {
    UniversalChatRequest,
    UniversalChatResponse,
    UniversalChatChunk,
    UniversalMessage,
    ModelInfo,
    LLMError,
} from './UniversalTypes';

/**
 * LLM 會話配置
 */
export interface LLMSessionConfig {
    model: string; // 模型名稱或別名
    apiKey?: string; // 如果不提供,會使用預設的 key manager
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    system_prompt?: string;
}

/**
 * LLM 統一管理器
 */
export class UniversalLLM {
    private adapter: LLMAdapter;
    private conversationHistory: UniversalMessage[] = [];
    private systemPrompt?: string;

    // 預設參數
    private temperature: number = 1.0;
    private maxTokens?: number;
    private topP?: number;

    constructor(config: LLMSessionConfig) {
        // 創建適配器
        const apiKey = config.apiKey || this.getDefaultApiKey(config.model);
        this.adapter = AdapterFactory.create(config.model, apiKey);

        // 設定參數
        if (config.temperature !== undefined) this.temperature = config.temperature;
        if (config.max_tokens !== undefined) this.maxTokens = config.max_tokens;
        if (config.top_p !== undefined) this.topP = config.top_p;
        if (config.system_prompt) this.systemPrompt = config.system_prompt;
    }

    // ==================== 主要 API ====================

    /**
     * 發送訊息並獲得回應
     * 
     * @param messages - 要發送的訊息 (會自動加入對話歷史)
     * @param options - 可選的請求選項
     */
    async chat(
        messages: UniversalMessage | UniversalMessage[],
        options?: Partial<UniversalChatRequest>
    ): Promise<Result<UniversalChatResponse, LLMError>> {
        // 準備訊息
        const newMessages = Array.isArray(messages) ? messages : [messages];

        // 建立完整的訊息列表
        const allMessages = this.buildMessageList(newMessages);

        // 建立請求
        const request: UniversalChatRequest = {
            messages: allMessages,
            temperature: options?.temperature ?? this.temperature,
            max_tokens: options?.max_tokens ?? this.maxTokens,
            top_p: options?.top_p ?? this.topP,
            stream: false,
            ...options,
        };

        // 發送請求
        const [response, error] = await this.adapter.chat(request);

        if (error) {
            return [null, error];
        }

        // 更新對話歷史
        this.conversationHistory.push(...newMessages);
        if (response.content || response.tool_calls) {
            this.conversationHistory.push({
                role: 'assistant',
                content: response.content,
                tool_calls: response.tool_calls,
            });
        }

        return [response, null];
    }

    /**
     * 發送訊息並獲得串流回應
     */
    async *chatStream(
        messages: UniversalMessage | UniversalMessage[],
        options?: Partial<UniversalChatRequest>
    ): AsyncGenerator<UniversalChatChunk, void, unknown> {
        const newMessages = Array.isArray(messages) ? messages : [messages];
        const allMessages = this.buildMessageList(newMessages);

        const request: UniversalChatRequest = {
            messages: allMessages,
            temperature: options?.temperature ?? this.temperature,
            max_tokens: options?.max_tokens ?? this.maxTokens,
            top_p: options?.top_p ?? this.topP,
            stream: true,
            ...options,
        };

        // 收集完整回應用於更新歷史
        let fullContent = '';
        let fullReasoningContent = '';

        try {
            for await (const chunk of this.adapter.chatStream(request)) {
                if (chunk.delta.content) {
                    fullContent += chunk.delta.content;
                }
                if (chunk.delta.reasoning_content) {
                    fullReasoningContent += chunk.delta.reasoning_content;
                }
                yield chunk;
            }

            // 更新對話歷史
            this.conversationHistory.push(...newMessages);
            this.conversationHistory.push({
                role: 'assistant',
                content: fullContent || null,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * 簡化的文字聊天 API
     * 
     * @param text - 使用者輸入的文字
     * @param options - 可選的請求選項
     */
    async sendMessage(
        text: string,
        options?: Partial<UniversalChatRequest>
    ): Promise<Result<string, LLMError>> {
        const message: UniversalMessage = {
            role: 'user',
            content: text,
        };

        const [response, error] = await this.chat(message, options);

        if (error) {
            return [null, error];
        }

        return [response.content || '', null];
    }

    // ==================== 對話歷史管理 ====================

    /**
     * 獲取對話歷史
     */
    getHistory(): UniversalMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * 設定對話歷史
     */
    setHistory(messages: UniversalMessage[]): void {
        this.conversationHistory = [...messages];
    }

    /**
     * 清空對話歷史
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }

    /**
     * 添加訊息到歷史 (不發送請求)
     */
    addToHistory(message: UniversalMessage): void {
        this.conversationHistory.push(message);
    }

    /**
     * 限制歷史長度 (保留最近的 N 條訊息)
     */
    limitHistory(maxMessages: number): void {
        if (this.conversationHistory.length > maxMessages) {
            this.conversationHistory = this.conversationHistory.slice(-maxMessages);
        }
    }

    // ==================== 系統提示詞管理 ====================

    /**
     * 設定系統提示詞
     */
    setSystemPrompt(prompt: string): void {
        this.systemPrompt = prompt;
    }

    /**
     * 獲取系統提示詞
     */
    getSystemPrompt(): string | undefined {
        return this.systemPrompt;
    }

    // ==================== 模型資訊 ====================

    /**
     * 獲取當前模型資訊
     */
    getModelInfo(): ModelInfo {
        return this.adapter.getModelInfo();
    }

    /**
     * 檢查模型是否支援某個功能
     */
    supports(capability: keyof ModelInfo['capabilities']): boolean | number {
        return this.adapter.supports(capability);
    }

    /**
     * 計算成本
     */
    calculateCost(usage: UniversalChatResponse['usage']) {
        return this.adapter.calculateCost(usage);
    }

    // ==================== 私有輔助方法 ====================

    /**
     * 建立完整的訊息列表 (包含系統提示詞和歷史)
     */
    private buildMessageList(newMessages: UniversalMessage[]): UniversalMessage[] {
        const messages: UniversalMessage[] = [];

        // 添加系統提示詞
        if (this.systemPrompt) {
            messages.push({
                role: 'system',
                content: this.systemPrompt,
            });
        }

        // 添加對話歷史
        messages.push(...this.conversationHistory);

        // 添加新訊息
        messages.push(...newMessages);

        return messages;
    }

    /**
     * 獲取預設的 API key
     * (這裡可以整合你的 KeyManager)
     */
    private getDefaultApiKey(model: string): string {
        // TODO: 整合你的 KeyManager
        throw new Error('No API key provided and no default key manager configured');
    }
}

/**
 * 便捷工廠函數
 */
export namespace UniversalLLM {
    /**
     * 快速創建一個 LLM 實例
     */
    export function create(
        model: string,
        apiKey?: string,
        systemPrompt?: string
    ): UniversalLLM {
        return new UniversalLLM({ model, apiKey, system_prompt: systemPrompt });
    }

    /**
     * 創建一個帶有對話歷史的 LLM 實例
     */
    export function createWithHistory(
        model: string,
        history: UniversalMessage[],
        apiKey?: string,
        systemPrompt?: string
    ): UniversalLLM {
        const llm = new UniversalLLM({ model, apiKey, system_prompt: systemPrompt });
        llm.setHistory(history);
        return llm;
    }
}
