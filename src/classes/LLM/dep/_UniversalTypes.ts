/**
 * 通用的 LLM 類型定義
 * 這些類型是給聊天控制模組使用的標準介面
 */

// ==================== 訊息格式 ====================

/**
 * 多模態內容部分
 */
export type UniversalContentPart =
    | { type: 'text'; text: string }
    | {
        type: 'image';
        mime_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
        data: string; // Base64 encoded
        detail?: 'auto' | 'low' | 'high'; // 圖片解析度
    };

/**
 * 標準化的訊息角色
 */
export type UniversalRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * 工具呼叫相關
 */
export interface UniversalToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

/**
 * 標準化的訊息
 */
export interface UniversalMessage {
    role: UniversalRole;
    content: string | UniversalContentPart[] | null;
    name?: string; // 訊息發送者的名稱
    tool_calls?: UniversalToolCall[];
    tool_call_id?: string; // 如果這是工具回應
}

// ==================== 請求參數 ====================

/**
 * 標準化的請求參數
 */
export interface UniversalChatRequest {
    messages: UniversalMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string | string[];

    // 進階功能 (不是所有模型都支援)
    tools?: UniversalTool[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
    response_format?: { type: 'text' | 'json_object' };

    // 模型特定的額外參數可以放這裡
    // 適配器會決定要不要使用
    extra?: Record<string, any>;
}

/**
 * 工具定義
 */
export interface UniversalTool {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters?: Record<string, any>; // JSON Schema
    };
}

// ==================== 回應格式 ====================

/**
 * Token 使用統計
 */
export interface UniversalUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;

    // 進階統計 (可選)
    cached_tokens?: number;
    reasoning_tokens?: number;
}

/**
 * 完成原因
 */
export type UniversalFinishReason =
    | 'stop'           // 正常結束
    | 'length'         // 達到 token 限制
    | 'tool_calls'     // 需要呼叫工具
    | 'content_filter' // 內容被過濾
    | 'error';         // 發生錯誤

/**
 * 標準化的回應
 */
export interface UniversalChatResponse {
    id: string;
    model: string;
    created: number;

    content: string | null;
    finish_reason: UniversalFinishReason;

    tool_calls?: UniversalToolCall[];

    usage: UniversalUsage;

    // 額外資訊 (模型特定)
    reasoning_content?: string; // Grok 的推理過程
    citations?: any[]; // 搜尋引用

    raw?: any; // 保留原始回應供 debug
}

/**
 * 串流回應的 chunk
 */
export interface UniversalChatChunk {
    id: string;
    model: string;
    created: number;

    delta: {
        role?: UniversalRole;
        content?: string;
        tool_calls?: Partial<UniversalToolCall>[];
        reasoning_content?: string;
    };

    finish_reason?: UniversalFinishReason;
    usage?: UniversalUsage;
}

// ==================== 成本計算 ====================

/**
 * 成本資訊
 */
export interface UniversalCost {
    currency: string; // 'USD', 'CNY', etc.
    amount: number;
    breakdown?: {
        input_cost: number;
        output_cost: number;
        cached_cost?: number;
        reasoning_cost?: number;
        search_cost?: number;
    };
}

// ==================== 模型能力 ====================

/**
 * 模型支援的功能
 */
export interface ModelCapabilities {
    text_input: boolean;
    image_input: boolean;
    audio_input: boolean;
    video_input: boolean;

    function_calling: boolean;
    structured_output: boolean;
    streaming: boolean;

    reasoning: boolean; // 像 o1 或 Grok 的推理模型
    web_search: boolean;

    max_context_length: number;
    max_output_tokens: number;
}

/**
 * 模型資訊
 */
export interface ModelInfo {
    provider: string; // 'grok', 'openai', 'anthropic', etc.
    name: string;
    aliases: string[];

    capabilities: ModelCapabilities;

    // 定價資訊 (每百萬 token)
    pricing?: {
        input: number;
        output: number;
        cached?: number;
    };

    // 速率限制
    rate_limits?: {
        requests_per_minute?: number;
        requests_per_second?: number;
        tokens_per_minute?: number;
    };
}

// ==================== 錯誤處理 ====================

/**
 * LLM 錯誤類型
 */
export enum LLMErrorType {
    AUTHENTICATION = 'authentication',
    RATE_LIMIT = 'rate_limit',
    INVALID_REQUEST = 'invalid_request',
    MODEL_ERROR = 'model_error',
    NETWORK_ERROR = 'network_error',
    TIMEOUT = 'timeout',
    UNKNOWN = 'unknown',
}

/**
 * LLM 錯誤
 */
export class LLMError extends Error {
    constructor(
        public type: LLMErrorType,
        message: string,
        public retryable: boolean = false,
        public retryAfter?: number // seconds
    ) {
        super(message);
        this.name = 'LLMError';
    }
}
