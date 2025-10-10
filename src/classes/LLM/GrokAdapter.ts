/**
 * Grok LLM 適配器
 * 
 * 將通用格式轉換為 Grok API 格式,並處理 Grok 特有的功能
 */

import { Result, tryCatch_flat } from '../Basic/GeneralTypes';
import { LLMAdapter } from './BaseAdapter';
import {
    UniversalChatRequest,
    UniversalChatResponse,
    UniversalChatChunk,
    UniversalMessage,
    UniversalContentPart,
    UniversalCost,
    ModelInfo,
    LLMError,
    LLMErrorType,
} from './UniversalTypes';
import {
    GrokModelInfo,
    GrokChatCompletion,
    GrokSupportedMessageParam,
    GrokPostParams,
} from './types';
import { GrokModel } from './Wrapper';

/**
 * Grok 適配器
 */
export class GrokAdapter extends LLMAdapter {
    estimateTokens(text: string): number {
        throw new Error('Method not implemented.');
    }
    private grokModel: GrokModel<GrokModelInfo>;

    constructor(apiKey: string, modelName: string) {
        // 根據 modelName 找到對應的 GrokModelInfo
        const grokInfo = GrokAdapter.getGrokModelInfo(modelName);
        const modelInfo = GrokAdapter.toUniversalModelInfo(grokInfo);

        super(apiKey, modelInfo);
        this.grokModel = new GrokModel(grokInfo);
    }

    async chat(
        request: UniversalChatRequest
    ): Promise<Result<UniversalChatResponse, LLMError>> {
        this.validateRequest(request);

        // 轉換為 Grok 格式
        const grokParams = this.toGrokParams(request);

        // 發送請求
        const [response, error] = await this.grokModel.post(this.apiKey, grokParams as any);

        if (error) {
            return [null, this.handleError(error)];
        }

        // 確保是 GrokChatCompletion 而不是 Response
        if (!response || response instanceof Response) {
            return [null, new LLMError(LLMErrorType.MODEL_ERROR, 'Invalid response type')];
        }

        // 轉換回通用格式
        const universalResponse = this.fromGrokResponse(response);
        return [universalResponse, null];
    }

    async *chatStream(
        request: UniversalChatRequest
    ): AsyncGenerator<UniversalChatChunk, void, unknown> {
        this.validateRequest(request);

        const grokParams = this.toGrokParams(request, true);
        const [response, error] = await this.grokModel.post(this.apiKey, grokParams as any);

        if (error) {
            throw this.handleError(error);
        }

        // 處理串流回應
        const reader = (response as Response).body?.getReader();
        if (!reader) {
            throw new LLMError(LLMErrorType.MODEL_ERROR, 'No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const chunk = JSON.parse(data);
                            yield this.fromGrokChunk(chunk);
                        } catch (e) {
                            console.error('Failed to parse chunk:', data, e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    calculateCost(usage: UniversalChatResponse['usage']): UniversalCost | null {
        const pricing = this.modelInfo.pricing;
        if (!pricing) return null;

        const inputCost = (usage.prompt_tokens * pricing.input) / 1_000_000;
        const outputCost = (usage.completion_tokens * pricing.output) / 1_000_000;
        const cachedCost = pricing.cached && usage.cached_tokens
            ? (usage.cached_tokens * pricing.cached) / 1_000_000
            : 0;

        return {
            currency: 'USD',
            amount: inputCost + outputCost + cachedCost,
            breakdown: {
                input_cost: inputCost,
                output_cost: outputCost,
                cached_cost: cachedCost,
            },
        };
    }

    // ==================== 格式轉換方法 ====================

    /**
     * 將通用請求轉換為 Grok 格式
     */
    private toGrokParams(
        request: UniversalChatRequest,
        stream: boolean = false
    ): Partial<GrokPostParams<GrokModelInfo>> {
        const params: any = {
            messages: request.messages.map(msg => this.toGrokMessage(msg)),
            stream,
        };

        if (request.temperature !== undefined) params.temperature = request.temperature;
        if (request.max_tokens !== undefined) params.max_tokens = request.max_tokens;
        if (request.top_p !== undefined) params.top_p = request.top_p;
        if (request.stop !== undefined) params.stop = request.stop;

        // Function calling
        if (request.tools) {
            params.tools = request.tools;
            if (request.tool_choice) params.tool_choice = request.tool_choice;
        }

        // Response format
        if (request.response_format) {
            params.response_format = request.response_format;
        }

        // Grok 特定參數
        if (request.extra?.search_parameters) {
            params.search_parameters = request.extra.search_parameters;
        }
        if (request.extra?.reasoning_effort) {
            params.reasoning_effort = request.extra.reasoning_effort;
        }

        if (stream) {
            params.stream_options = { include_usage: true };
        }

        return params;
    }

    /**
     * 轉換單一訊息
     */
    private toGrokMessage(msg: UniversalMessage): GrokSupportedMessageParam {
        const grokMsg: any = {
            role: msg.role,
        };

        // 處理內容
        if (typeof msg.content === 'string') {
            grokMsg.content = msg.content;
        } else if (Array.isArray(msg.content)) {
            grokMsg.content = msg.content.map(part => this.toGrokContentPart(part));
        } else {
            grokMsg.content = msg.content;
        }

        if (msg.name) grokMsg.name = msg.name;
        if (msg.tool_calls) grokMsg.tool_calls = msg.tool_calls;
        if (msg.tool_call_id) grokMsg.tool_call_id = msg.tool_call_id;

        return grokMsg;
    }

    /**
     * 轉換內容部分
     */
    private toGrokContentPart(part: UniversalContentPart): any {
        if (part.type === 'text') {
            return { type: 'text', text: part.text };
        } else if (part.type === 'image') {
            return {
                type: 'image_url',
                image_url: {
                    url: `data:${part.mime_type};base64,${part.data}`,
                    detail: part.detail || 'auto',
                },
            };
        }
        return part;
    }

    /**
     * 將 Grok 回應轉換為通用格式
     */
    private fromGrokResponse(response: GrokChatCompletion): UniversalChatResponse {
        const choice = response.choices[0];
        const message = choice.message;

        return {
            id: response.id,
            model: response.model,
            created: response.created,
            content: message.content,
            finish_reason: this.mapFinishReason(choice.finish_reason),
            tool_calls: message.tool_calls as any,
            usage: {
                prompt_tokens: response.usage.prompt_tokens,
                completion_tokens: response.usage.completion_tokens,
                total_tokens: response.usage.total_tokens,
                cached_tokens: response.usage.prompt_tokens_details.cached_tokens,
                reasoning_tokens: response.usage.completion_tokens_details.reasoning_tokens,
            },
            reasoning_content: (message as any).reasoning_content,
            citations: response.usage.num_sources_used > 0 ? [] : undefined,
            raw: response,
        };
    }

    /**
     * 將 Grok chunk 轉換為通用格式
     */
    private fromGrokChunk(chunk: any): UniversalChatChunk {
        const choice = chunk.choices?.[0];

        return {
            id: chunk.id,
            model: chunk.model,
            created: chunk.created,
            delta: {
                role: choice?.delta?.role,
                content: choice?.delta?.content,
                reasoning_content: choice?.delta?.reasoning_content,
                tool_calls: choice?.delta?.tool_calls,
            },
            finish_reason: choice?.finish_reason
                ? this.mapFinishReason(choice.finish_reason)
                : undefined,
            usage: chunk.usage ? {
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens,
                total_tokens: chunk.usage.total_tokens,
                cached_tokens: chunk.usage.prompt_tokens_details?.cached_tokens,
                reasoning_tokens: chunk.usage.completion_tokens_details?.reasoning_tokens,
            } : undefined,
        };
    }

    /**
     * 映射結束原因
     */
    private mapFinishReason(reason: string): UniversalChatResponse['finish_reason'] {
        switch (reason) {
            case 'stop': return 'stop';
            case 'length': return 'length';
            case 'tool_calls': return 'tool_calls';
            case 'content_filter': return 'content_filter';
            default: return 'stop';
        }
    }

    /**
     * 處理錯誤
     */
    private handleError(error: Error): LLMError {
        const message = error.message.toLowerCase();

        if (message.includes('unauthorized') || message.includes('invalid api key')) {
            return new LLMError(LLMErrorType.AUTHENTICATION, error.message);
        } else if (message.includes('rate limit')) {
            return new LLMError(LLMErrorType.RATE_LIMIT, error.message, true, 60);
        } else if (message.includes('timeout')) {
            return new LLMError(LLMErrorType.TIMEOUT, error.message, true);
        } else if (message.includes('network') || message.includes('fetch')) {
            return new LLMError(LLMErrorType.NETWORK_ERROR, error.message, true);
        } else {
            return new LLMError(LLMErrorType.UNKNOWN, error.message);
        }
    }

    // ==================== 靜態輔助方法 ====================

    /**
     * 根據模型名稱獲取 GrokModelInfo
     */
    private static getGrokModelInfo(modelName: string): GrokModelInfo {
        const lowerName = modelName.toLowerCase();

        // 這裡需要導入你的 Grok 模型定義
        // 暫時返回一個預設值,你需要根據實際情況修改
        if (lowerName.includes('grok-4')) {
            return {
                Name: 'grok-4-0709',
                Aliases: ['grok-4', 'grok-4-latest'],
                Modalities: { TextInput: true, ImageInput: true },
                Capabilities: {
                    FunctionCalling: true,
                    StructuredOutput: true,
                    Reasoning: true,
                },
                RateLimits: {
                    request: { limit: 480, type: 0, window: 60 },
                    token: { limit: 2_000_000, type: 1, window: 60 },
                },
                Pricing: {
                    input: 3 / 1_000_000,
                    cached: 0.75 / 1_000_000,
                    output: 15 / 1_000_000,
                },
                HighPricing: {
                    input: 6 / 1_000_000,
                    output: 30 / 1_000_000,
                },
                LiveSearchPricing: 0.025,
                HighInputPoint: 128_000,
                Context: 256_000,
                ReasoningModel: true,
                ReasoningContent: false,
                ReasoningEffort: false,
            } as GrokModelInfo;
        }

        throw new Error(`Unknown Grok model: ${modelName}`);
    }

    /**
     * 將 GrokModelInfo 轉換為通用 ModelInfo
     */
    private static toUniversalModelInfo(grokInfo: GrokModelInfo): ModelInfo {
        return {
            provider: 'grok',
            name: grokInfo.Name,
            aliases: [...grokInfo.Aliases],
            capabilities: {
                text_input: grokInfo.Modalities.TextInput,
                image_input: grokInfo.Modalities.ImageInput,
                audio_input: false,
                video_input: false,
                function_calling: grokInfo.Capabilities.FunctionCalling,
                structured_output: grokInfo.Capabilities.StructuredOutput,
                streaming: true,
                reasoning: grokInfo.Capabilities.Reasoning,
                web_search: grokInfo.LiveSearchPricing !== null,
                max_context_length: grokInfo.Context,
                max_output_tokens: 16_384, // Grok 的預設值
            },
            pricing: {
                input: grokInfo.Pricing.input * 1_000_000,
                output: grokInfo.Pricing.output * 1_000_000,
                cached: grokInfo.Pricing.cached * 1_000_000,
            },
            rate_limits: {
                requests_per_minute: grokInfo.RateLimits.request?.limit,
                tokens_per_minute: grokInfo.RateLimits.token?.limit,
            },
        };
    }
}
