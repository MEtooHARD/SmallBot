import * as Discord from 'discord.js';
import { GuildMessage } from '../Basic/DiscordTypes';


export namespace ULLM {
    export enum Providers {
        // OPENAI = 'openai',
        // ANTHROPIC = 'anthropic',
        GOOGLE = 'google',
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
        key: IKey;
        dc_messages: InputMessage[];
        system_prompts: SystemMessage[];
        // content control
        include_images?: boolean
        include_custom_emoji?: boolean

        // Generation parameters
        stream?: boolean;
        max_token?: number;
        temperature?: number;
        top_p?: number;
        // stop?: string | string[];
    }
    // #endregion
    // #region Response
    export type Response = {
        content: string;
    };
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