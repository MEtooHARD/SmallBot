import * as Discord from 'discord.js';
import { GuildMessage } from '../Basic/DiscordTypes';


export namespace ULLM {
    export enum Providers {
        // OPENAI = 'openai',
        // ANTHROPIC = 'anthropic',
        // GOOGLE = 'google',
        XAI = 'xai'
    }
    // #region Media
    export enum MediaType {
        JPEG = 'image/jpeg',
        PNG = 'image/png',
        WEBP = 'image/webp',  // 實測可用
        // GIF = 'image/gif',    // 實測不可用 (非動畫)
        // 以下可能支援但未測試:
        // BMP = 'image/bmp',
        // TIFF = 'image/tiff',
    }

    export type MediaRepresentation = 'url' | 'base64';
    export type MediaOrigin = 'attachment' | 'emoji' | 'sticker' | 'url';
    export type MediaDetail = 'auto' | 'low' | 'high';

    export interface Media<R = MediaRepresentation, M = string, O = MediaOrigin> {
        type: R;
        content: string;  // URL string or base64 data
        mimeType: M; // e.g., 'image/png', 'image/jpeg'
        origin: O;
        detail?: MediaDetail;  // Vision API detail level
        fileName?: string;  // Optional for unsupported media messages
    }
    export function Media(type: MediaRepresentation, content: string, mimeType: string, origin: MediaOrigin, detail?: MediaDetail, fileName?: string): Media {
        return { type, content, mimeType, origin, detail, fileName };
    }
    // #endregion

    // #region Message
    export enum Role { SYSTEM, USER, BOT, SELF, TOOL }

    export enum UserMessageType {
        PURE_TEXT,
        PURE_IMAGE,
        MIXED
    }
    export function classifyMessage(msg: Discord.Message<true>): UserMessageType {
        if (msg.attachments.size === 0)
            return UserMessageType.PURE_TEXT;
        if (msg.content.length === 0)
            return UserMessageType.PURE_IMAGE;
        return UserMessageType.MIXED;
    }
    export type UserMessage = {
        role: Role.USER,
        obj: GuildMessage
    }
    export type UserBotMessage = {
        role: Role.BOT,
        obj: GuildMessage
    }
    export type BotMessage = {
        role: Role.SELF,
        content: string
    }
    export type SystemMessage = {
        role: Role.SYSTEM,
        content: string
    }
    export type InputMessage = UserMessage | BotMessage | SystemMessage | UserBotMessage;
    // #endregion
    // #region Request
    export interface ChatRequest {
        dc_messages: InputMessage[];
        system_prompts: SystemMessage[];

        web_search?: boolean;
        // content control
        include_images?: boolean;
        include_custom_emoji?: boolean;

        // Generation parameters
        stream?: boolean;
        stream_include_usage?: boolean;
        max_token?: number;
        temperature?: number;
        top_p?: number;
        // stop?: string | string[];
    }
    // #endregion
    // #region Response
    export type NonStreamResponse = { content: string; };
    export type StreamResponse = { stream: AsyncGenerator<Chunk, void, unknown> };
    export type Response = NonStreamResponse | StreamResponse;
    export function isStreamResponse(res: Response)
        : res is StreamResponse { return 'stream' in res; }

    // Chunk 根據 Grok streaming 流程設計：
    // 1. RoleChunk - 指示回應者角色（首個 chunk）
    // 2. ReasoningChunk - 思考過程（如果模型支援）
    // 3. ContentChunk - 主要內容
    // 4. ToolCallChunk - Function calling（預留）
    // 5. FinishChunk - 結束標記
    // 6. [DONE] - SSE 協議標記，Generator 內部處理，不暴露給使用者

    export type CodeStage = 'start' | 'middle' | 'end' | 'complete';

    export type RoleChunk = { role: 'assistant' /* | 'tool' */; };
    export type ReasoningChunk =
        | { reasoning: string; }
        | { reasoning: string; code: CodeStage; lang: string };
    export type ContentChunk =
        | { content: string; }
        | { content: string; code: CodeStage; lang: string };
    export type ToolCallChunk = { tool_calls: unknown[];  /* 預留，之後再細化 */ };
    export type UsageChunk = {
        usage: {
            prompt_tokens: number,
            completion_tokens: number,
            total_tokens: number,
            prompt_tokens_details: { text_tokens: number, audio_tokens: number, image_tokens: number, cached_tokens: number },
            completion_tokens_details: { reasoning_tokens: number, audio_tokens: number, accepted_prediction_tokens: number, rejected_prediction_tokens: number },
            num_sources_used: number
        }
    }
    export type FinishChunk = {
        finishReason: 'stop' | 'length' | 'error';
        citations?: string[];
    };

    export type Chunk =
        | RoleChunk
        | ReasoningChunk   // 只有當 RC = true 時才包含
        | ContentChunk
        // | ToolCallChunk
        | UsageChunk
        | FinishChunk;
    // #endregion
    // #region General
    export enum RateType { Request, Token }
    export interface RateLimit {
        type: RateType,
        limit: number,
        window: number
    }

    // Generic rate limit types with literal number
    export function RPM(rate: number): RPM<number> {
        return { type: RateType.Request, window: 60, limit: rate };
    }
    export type RPM<Rate extends number> = RateLimit & {
        type: RateType.Request, window: 60, limit: Rate
    };

    export function RPS(rate: number): RPS<number> {
        return { type: RateType.Request, window: 1, limit: rate };
    }
    export type RPS<Rate extends number> = RateLimit & {
        type: RateType.Request, window: 1, limit: Rate
    };

    export function TPM(rate: number): TPM<number> {
        return { type: RateType.Token, window: 60, limit: rate };
    }
    export type TPM<Rate extends number> = RateLimit & {
        type: RateType.Token, window: 60, limit: Rate
    };

    export type Pricing = {
        input: number,
        cached: number,
        output: number
    }
    // #endregion
}