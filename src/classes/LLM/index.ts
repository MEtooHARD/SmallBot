/**
 * LLM 模組入口
 * 
 * 導出所有需要的類型和類別
 */

// 初始化適配器 (必須先執行)
import './dep/init';

// 主要 API
export { UniversalLLM, LLMSessionConfig } from './dep/_UniversalLLM';

// 類型定義
export {
    // 訊息相關
    UniversalMessage,
    UniversalContentPart,
    UniversalRole,
    UniversalToolCall,
    UniversalTool,

    // 請求相關
    UniversalChatRequest,

    // 回應相關
    UniversalChatResponse,
    UniversalChatChunk,
    UniversalFinishReason,
    UniversalUsage,

    // 模型資訊
    ModelInfo,
    ModelCapabilities,

    // 成本
    UniversalCost,

    // 錯誤
    LLMError,
    LLMErrorType,
} from './dep/_UniversalTypes';

// 適配器相關 (通常不需要直接使用)
export { LLMAdapter, AdapterFactory } from './_BaseAdapter';
export { GrokAdapter } from './_GrokAdapter';

// 工廠函數
export { initializeLLMAdapters } from './dep/init';
