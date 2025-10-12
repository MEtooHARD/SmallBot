import * as Discord from 'discord.js';
import { GuildMessage } from '../Basic/DiscordTypes';
import { IKEY } from './KEY';


export namespace ULLMTypes {
    // #region Message
    export enum MediaType {
        JPEG = 'image/jpeg',
        PNG = 'image/png',
        WEBP = 'image/webp',
        // GIF = 'image/gif',
    }

    export enum Role { SYSTEM, USER, SELF, TOOL }

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
    export type BotMessage = {
        role: Role.SELF,
        content: string
    }
    export type SystemMessage = {
        role: Role.SYSTEM,
        content: string
    }
    export type InputMessage = UserMessage | BotMessage | SystemMessage;
    // #endregion
    // #region Request
    export interface ChatRequest {
        key: IKEY;
        dc_messages: InputMessage[];
        system_prompts?: InputMessage[];

        // Generation parameters
        stream?: boolean;
        max_token?: number;
        temperature?: number;
        top_p?: number;
        // stop?: string | string[];
    }
    // #endregion
    // #region Response
    export interface Response {
        content?: string;
    }
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
        return {
            type: RateType.Request,
            window: 60,
            limit: rate
        };
    }
    export type RPM<Rate extends number> = RateLimit & {
        type: RateType.Request,
        window: 60,
        limit: Rate
    };

    export function RPS(rate: number): RPS<number> {
        return {
            type: RateType.Request,
            window: 1,
            limit: rate
        };
    }
    export type RPS<Rate extends number> = RateLimit & {
        type: RateType.Request,
        window: 1,
        limit: Rate
    };

    export function TPM(rate: number): TPM<number> {
        return {
            type: RateType.Token,
            window: 60,
            limit: rate
        };
    }
    export type TPM<Rate extends number> = RateLimit & {
        type: RateType.Token,
        window: 60,
        limit: Rate
    };

    export type Pricing = {
        input: number,
        cached: number,
        output: number
    }
    // #endregion
}