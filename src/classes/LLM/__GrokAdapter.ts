import OpenAI from "openai";
import { ChatCompletionAssistantMessageParam, ChatCompletionCreateParamsBase, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/completions";
import { Result } from "../Basic/GeneralTypes";
import { Adapter } from "./__Adapter";
import { ULLMTypes } from "./__Types";


abstract class GrokAdapter extends Adapter implements Adapter {
    abstract readonly model_info: GrokModelInfo;
    private static readonly URL = 'https://api.x.ai/v1';

    constructor() { super(); }

    async post(req: ULLMTypes.ChatRequest): Promise<ULLMTypes.Response> {
        const input_messages = [req.system_prompts?.[0], ...req.dc_messages]
            .filter(m => m !== undefined);

        await req.key.useFetch<GrokPostParams<GrokModelInfo>>(
            GrokAdapter.URL,
            'POST',
            'authorization',
            'Bearer ',
            {},
            this.buildParams(input_messages, req)
        );

        return {
        };
    }

    protected abstract buildParams(
        input_messages: ULLMTypes.InputMessage[],
        req: ULLMTypes.ChatRequest
    ): GrokPostParams<GrokModelInfo>;

    protected transformMessage(
        // req: ULLMTypes.ChatRequest,
        message: ULLMTypes.InputMessage
    ): GrokSupportedMessageParam {
        if (message.role === ULLMTypes.Role.USER)
            return {
                role: 'user',
                content: message.obj.content,
                name: message.obj.author.username
            };
        if (message.role === ULLMTypes.Role.SELF)
            return {
                role: 'assistant',
                content: message.content
            };
        // SYSTEM
        return {
            role: 'system',
            content: message.content
        };
    }
}

const Grok_4_info: GrokModelInfo = {
    Name: 'grok-4-0709',
    Aliases: ['grok-4', 'grok-4-latest'],
    Modalities: { TextInput: true, ImageInput: true, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: ULLMTypes.RPM(480), token: ULLMTypes.TPM(2_000_000) },
    Pricing: { input: 3 / 1_000_000, cached: 0.75 / 1_000_000, output: 15 / 1_000_000 },
    HighPricing: { input: 6 / 1_000_000, output: 30 / 1_000_000 },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 256_000,

    ReasoningOnlyModel: true,
    ReasoningContent: false,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;

class Grok_4 extends GrokAdapter {
    readonly model_info = Grok_4_info;

    protected buildParams(
        input_messages: ULLMTypes.InputMessage[],
        req: ULLMTypes.ChatRequest
    ): GrokPostParams<GrokModelInfo> {
        const messages_params: GrokSupportedMessageParam[] = input_messages
            .map(m => this.transformMessage(m));

        return {
            model: this.model_info.Name,
            messages: messages_params
        }
    }
}

interface GrokModelInfo {
    readonly Name: string;
    readonly Aliases: readonly string[];

    readonly Modalities: {
        readonly TextInput: boolean,
        readonly ImageInput: boolean,
        readonly TextOutput: boolean,
        readonly ImageOutput: boolean
    }
    readonly Capabilities: {
        readonly FunctionCalling: boolean,
        readonly StructuredOutput: boolean,
        readonly Reasoning: boolean
    }
    readonly RateLimits: {
        readonly request: ULLMTypes.RPM<number> | ULLMTypes.RPS<number> | null,
        readonly token: ULLMTypes.TPM<number> | null
    };

    readonly Pricing: ULLMTypes.Pricing;
    readonly HighPricing: Partial<ULLMTypes.Pricing>;
    readonly LiveSearchPricing: number | null;
    readonly HighInputPoint: number | null;
    readonly Context: number;

    readonly ReasoningOnlyModel: boolean;
    readonly ReasoningContent: boolean;
    readonly ReasoningEffort: boolean;
}

// Grok Adapter Registry
export class Grok {
    private constructor() { }

    static readonly _4 = new Grok_4();
}

// #region Grok API Types
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

export type GrokChunkDeltaCompletion = {
    content: string
};

export type GrokChunkDeltaReasoning<I extends GrokModelInfo> = {
    reasoning_content: I['ReasoningContent'] extends true ? string : never
}

export type GrokChunkDelta<I extends GrokModelInfo, T extends GrokChunkType>
    = T extends 'reasoning' ? GrokChunkDeltaReasoning<I>
    : T extends 'completion' ? GrokChunkDeltaCompletion
    : never;

export type GrokChunkChoice<I extends GrokModelInfo, T extends GrokChunkType> = {
    index: number,
    delta: GrokChunkDelta<I, T>,
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

type ReasoningEffortParam<I extends GrokModelInfo> =
    I['ReasoningEffort'] extends true
    ? { reasoning_effort?: ParamsBase['reasoning_effort'] }
    : { reasoning_effort?: never };

type ReasoningModelParams<I extends GrokModelInfo> =
    I['ReasoningOnlyModel'] extends false
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

// Grok doesn't support developer message
export type GrokSupportedMessageParam =
    | ChatCompletionSystemMessageParam
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam & {
        audio?: never;  // Grok 不支援 audio
        refusal?: never;  // Grok 可能不支援 refusal（需要測試）
    }
// | ChatCompletionToolMessageParam;

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

export type Cost = {
    prompt_tokens: number,
    cached_tokens: number,
    output_text: number,
    output_reasoning: number,
    citations: number,
}
// #endregion