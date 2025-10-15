import { Attachment } from "discord.js";
import OpenAI from "openai";
import { ChatCompletionAssistantMessageParam, ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionCreateParamsBase, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/completions";
import { isDev } from "../../../app";
import { extractEmojis } from "../../../functions/discord/mention";
import { emojiUrl } from "../../../functions/discord/messaging";
import { GuildMessage } from "../../Basic/DiscordTypes";
import { Result, tryCatch } from "../../Basic/GeneralTypes";
import { Adapter } from "../__Adapter";
import { ULLM } from "../__Types";
import { Grok_4_info } from "./ModelInfo";


type GrokMedia = ULLM.Media<'url', string, Omit<ULLM.MediaOrigin, 'sticker'>>;

// #region GrokAdapter
abstract class GrokAdapter extends Adapter implements Adapter {
    abstract readonly model_info: GrokModelInfo;
    protected static readonly Chat_Completion_URL = 'https://api.x.ai/v1/chat/completions';

    protected readonly supMimeTypes: string[] = Object.values(ULLM.MediaType);
    protected readonly supMediaRepresentations: ULLM.MediaRepresentation[] = ['url'];

    constructor() { super(); }
    // #region post
    async post(req: ULLM.ChatRequest): Promise<ULLM.Response> {
        const input_messages = this.formInputMessageSeq(req);
        const headers = this.buildHeaders(req);
        const params = this.buildParams(input_messages, req);

        if (isDev) {
            console.log('===params===');
            console.log(params);
            console.log('===messages===');
            console.log(params.messages);
            console.log('===contents===');
            for (const msg of params.messages) console.log(msg.content);
        }

        const [res, err] = await tryCatch<GrokChatCompletion>(req.key.useFetch<GrokPostParams<GrokModelInfo>>(
            GrokAdapter.Chat_Completion_URL, 'POST',
            'authorization', 'Bearer ',
            headers,
            params
        ));

        if (err) throw err;

        if (isDev) console.log('Grok API Response:', JSON.stringify(res, null, 2));

        const content = res.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in response');

        return { content };
    }
    //#endregion

    protected *formInputMessageSeq(
        req: ULLM.ChatRequest
    ): Generator<ULLM.InputMessage> {
        yield* req.system_prompts;
        yield* req.dc_messages;
    }

    protected buildHeaders(req: ULLM.ChatRequest): Record<string, string> { return {} }

    protected buildParams(
        input_messages: IterableIterator<ULLM.InputMessage>,
        req: ULLM.ChatRequest
    ): GrokPostParams<GrokModelInfo> {
        const messages = Array.from(this.transformMessages(input_messages, req));

        return {
            model: this.model_info.Name,
            messages
        }
    };

    protected *transformMessages(
        messages: IterableIterator<ULLM.InputMessage>,
        req: ULLM.ChatRequest
    ): Generator<GrokSupportedMessageParam> {
        for (const message of messages)
            switch (message.role) {
                case ULLM.Role.USER:
                case ULLM.Role.BOT:
                    const content: GrokContentPart[] = [];
                    // Add text
                    content.push(this.toTextContent(message.obj));
                    // Filter and add supported media
                    content.push(...this.toMediaContent(this.collectMedia(message.obj, req)));
                    if (content.length > 0)
                        yield { role: 'user', content, name: message.obj.author.username };
                    break;
                case ULLM.Role.SELF:
                    yield { role: 'assistant', content: message.content };
                    break;
                case ULLM.Role.SYSTEM:
                    yield { role: 'system', content: message.content };
                    break;
            }
    }
    // #region Content
    protected toTextContent(message: GuildMessage): GrokContentPart { return { type: 'text', text: message.content }; }
    protected * collectMedia(message: GuildMessage, req: ULLM.ChatRequest): Generator<GrokMedia> {
        if (req.include_custom_emoji) yield* this.collectEmojiMedia(message.content);
        if (req.include_images) yield* this.collectImageMedia(message.attachments.values());
    }
    protected * collectEmojiMedia(msgContent: string): Generator<GrokMedia> {
        for (const emoji of extractEmojis(msgContent))
            yield { type: 'url', content: emojiUrl(emoji[2]), mimeType: 'image/png', origin: 'emoji', detail: 'low' };
    }
    protected * collectImageMedia(attachments: IterableIterator<Attachment>): Generator<GrokMedia> {
        for (const attachment of attachments)
            yield { type: 'url', content: attachment.url, mimeType: attachment.contentType || 'unknown', origin: 'attachment', detail: 'auto', fileName: attachment.name };
    }
    protected * toMediaContent(mediaIterator: IterableIterator<GrokMedia>): Generator<GrokContentPart> {
        for (const media of mediaIterator) {
            if (this.supMimeTypes.includes(media.mimeType))
                yield { type: 'image_url', image_url: { url: media.content, detail: media.detail ?? 'auto' } };
            else
                yield { type: 'text', text: `[${media.origin === 'emoji' ? 'Custom emoji' : 'Attachment'}: ${media.fileName || 'unnamed file'} (${media.mimeType}) - format not supported by this model]` };
        }
    }
    // #endregion
}
// #endregion

class Grok_4 extends GrokAdapter { readonly model_info = Grok_4_info; }

// Grok Adapter Registry
export class Grok {
    private constructor() { }

    static readonly _4 = new Grok_4();
}

// #region Model Info Type
export interface GrokModelInfo {
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
        readonly request: ULLM.RPM<number> | ULLM.RPS<number> | null,
        readonly token: ULLM.TPM<number> | null
    };

    readonly Pricing: ULLM.Pricing;
    readonly HighPricing: Partial<ULLM.Pricing>;
    readonly LiveSearchPricing: number | null;
    readonly HighInputPoint: number | null;
    readonly Context: number;

    readonly ReasoningOnlyModel: boolean;
    readonly ReasoningContent: boolean;
    readonly ReasoningEffort: boolean;
}
// #endregion

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



export type GrokContentPart =
    | ChatCompletionContentPartText
    | ChatCompletionContentPartImage
// | ChatCompletionContentPartInputAudio
// | ChatCompletionContentPart.File;

// 限制 UserMessage 的 content 類型
export type GrokUserMessageParam = Omit<ChatCompletionUserMessageParam, 'content'> & {
    content: string | Array<GrokContentPart>
}

export type GrokSupportedMessageParam =
    | ChatCompletionSystemMessageParam
    | GrokUserMessageParam
    | (Omit<ChatCompletionAssistantMessageParam, 'audio' | 'refusal'> & {
        audio?: never;  // Grok 不支援 audio
        refusal?: never;  // Grok 可能不支援 refusal（需要測試）
    })
// | ChatCompletionToolMessageParam;

export type GrokPostParams<I extends GrokModelInfo> =
    OpenAI.Chat.Completions.ChatCompletionCreateParams &
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