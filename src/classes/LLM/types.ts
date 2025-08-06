import OpenAI from "openai";
import { Result } from "../Basic/GeneralTypes";
import { ChatCompletionCreateParamsBase, ChatCompletionDeveloperMessageParam, ChatCompletionMessageParam } from "openai/resources/chat/completions";

export enum RateType { Request, Token }
export interface RateLimit {
    type: RateType,
    limit: number,
    window: number
}
type RPM = RateLimit & { type: RateType.Request, window: 60 };
type RPS = RateLimit & { type: RateType.Request, window: 1 };
type TPM = RateLimit & { type: RateType.Token, window: 60 };

export type Pricing = {
    input: number,
    cached: number,
    output: number
}

export const LiveSearchPrice = 0.025;

export interface GrokModelInfo {
    readonly Name: string;
    readonly Aliases: readonly string[];

    readonly Modalities: {
        TextInput: boolean,
        ImageInput: boolean
    }
    readonly Capabilities: {
        FunctionCalling: boolean,
        StructuredOutput: boolean,
        Reasoning: boolean
    }
    readonly RateLimits: {
        request: RPM | RPS | null,
        token: TPM | null
    };

    readonly Pricing: Pricing;
    readonly HighPricing: Partial<Pricing>;
    readonly LiveSearchPricing: number | null;
    readonly HighInputPoint: number | null;
    readonly Context: number;

    readonly ReasoningModel: boolean;
    readonly ReasoningContent: boolean;
    readonly ReasoningEffort: boolean;
}

export type GrokChatCompletion = OpenAI.Chat.Completions.ChatCompletion & {
    choices: {
        message: {
            reasoning_content?: string
        }
    }[],
    usage: {
        prompt_tokens_details: {
            text_tokens: number,
            audio_tokens: number,
            image_tokens: number,
            cached_tokens: number
        }
        completion_tokens_details: {
            reasoning_tokens: number,
            audio_tokens: number,
            accepted_prediction_tokens: number,
            rejected_prediction_tokens: number
        },
        num_sources_used: number
    }
}

export type GrokRole = 'system' | 'user' | 'assistant';
export type GrokChunkType = 'reasoning' | 'completion' | 'finish' | 'usage' | 'done';
export type GrokFinishReason = 'stop' | string;

export type GrokChunkChoiceDeltaCompletion
    = { content: string }
export type GrokChunkChoiceDeltaReasoning<I extends GrokModelInfo>
    = { reasoning_content: I['ReasoningContent'] extends true ? string : never }
export type GrokChunkChoiceDelta<I extends GrokModelInfo, T extends GrokChunkType>
    = T extends 'reasoning' ? GrokChunkChoiceDeltaReasoning<I>
    : T extends 'completion' ? GrokChunkChoiceDeltaCompletion
    : never;
export type GrokChunkChoice<I extends GrokModelInfo, T extends GrokChunkType> = {
    index: number,
    delta: GrokChunkChoiceDelta<I, T>,
    finish_reason: T extends 'finish' ? GrokFinishReason : never
}

export type GrokChatChunk<
    I extends GrokModelInfo,
    T extends GrokChunkType
> = T extends 'done' ? '[DONE]'
    : {
        id: string,
        object: string,
        created: number,
        model: string,
        choices: GrokChunkChoice<I, T>[],
        usage: T extends 'usage' ? GrokChatCompletion['usage'] : never,
        system_fingerprint: string
    };

type ParamsBase = ChatCompletionCreateParamsBase;

type CommonGrokParams = Partial<{
    deferred: boolean,
    search_parameters: Partial<{
        from_date: string,
        max_search_results: number,
        mode: 'off' | 'on' | 'auto',
        return_citations: boolean,
        sources: string,
        to_date: string
    }>,
    stream_options: Partial<{ include_usage: boolean }>,
}>;

type ReasoningEffortParam<I extends GrokModelInfo> = I['ReasoningEffort'] extends true
    ? { reasoning_effort?: ParamsBase['reasoning_effort'] }
    : { reasoning_effort?: never };

type ReasoningModelParams<I extends GrokModelInfo> = I['ReasoningModel'] extends false
    ? {
        presence_penalty?: ParamsBase['presence_penalty'],
        frequency_penalty?: ParamsBase['frequency_penalty'],
        stop?: ParamsBase['stop']
    }
    : {
        presence_penalty?: never,
        frequency_penalty?: never,
        stop?: never
    };

type GrokSupportedMessageParam = Exclude<
    ChatCompletionMessageParam,
    ChatCompletionDeveloperMessageParam
>;

export type GrokPostParams<I extends GrokModelInfo> = (
    OpenAI.Chat.Completions.ChatCompletionCreateParams |
    OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
) &
    CommonGrokParams &
    ReasoningEffortParam<I> &
    ReasoningModelParams<I> & {
        messages: Array<GrokSupportedMessageParam>
    }

export type GrokPostFunction = <I extends GrokModelInfo>(
    url: string,
    key: string,
    params: GrokPostParams<I>
) => Promise<Result<GrokChatCompletion>>;