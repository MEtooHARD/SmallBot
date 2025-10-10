

export abstract class LLM {
    abstract ToRequestJson(): any;
}


// --- 1. 標準化的訊息格式 (Standardized Message Format) ---

// 用於支援多模態輸入 (文字、圖片等)
export type UniversalContentPart = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
    data: Buffer | string; // Base64 string or Buffer
};

// 一則標準化的訊息
export interface UniversalMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | UniversalContentPart[]; // 簡單文字或多模態內容
    // 可選，用於 function calling/tool use
    tool_calls?: any;
    tool_call_id?: string;
}

// --- 2. 標準化的請求參數 (Standardized Request Parameters) ---

export interface UniversalChatParams {
    messages: UniversalMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    // ... 其他通用參數
}

// --- 3. 標準化的回應格式 (Standardized Response Format) ---

export interface UniversalUsageStats {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface UniversalChatResponse {
    content: string | null;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'error' | string;
    usage: UniversalUsageStats;
    // ... 其他通用回傳值
}