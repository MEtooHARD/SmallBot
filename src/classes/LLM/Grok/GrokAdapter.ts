import { Attachment } from "discord.js";
import OpenAI from "openai";
import {
    ChatCompletionAssistantMessageParam,
    ChatCompletionContentPartImage,
    ChatCompletionContentPartText,
    ChatCompletionCreateParamsBase,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam
} from "openai/resources/chat/completions";
import { isDev } from "../../../app";
import { extractEmojis } from "../../../functions/discord/mention";
import { emojiUrl } from "../../../functions/discord/messaging";
import { GuildMessage } from "../../Basic/DiscordTypes";
import { Result, tryCatch } from "../../Basic/GeneralTypes";
import { Adapter } from "../__Adapter";
import { UniLLM } from "../__Types";
import { FetchProxy } from "../Keyring";
import { grok_3_mini_info, grok_4_1_fast_reasoning_info, grok_4_fast_reasoning_info, grok_4_info } from "./ModelInfo";
import chalk from "chalk";
import { dev_log } from "../../../functions/general/log";


type GrokMedia = UniLLM.Media<'url', string, Omit<UniLLM.MediaOrigin, 'sticker'>>;

// #region GrokAdapter
abstract class GrokAdapter extends Adapter implements Adapter {
    readonly Provider: string = 'xai';
    abstract override readonly model_info: GrokModelInfo;

    protected static readonly ChatCompletionURL = 'https://api.x.ai/v1/chat/completions';

    protected readonly supMimeTypes: string[] = Object.values(UniLLM.MediaType);
    protected readonly supMediaRepresentations: UniLLM.MediaRepresentation[] = ['url'];

    constructor() { super(); }
    // #region post
    async post(fetch: FetchProxy, req: UniLLM.ChatRequest & { stream: true }): Promise<UniLLM.StreamResponse>;
    async post(fetch: FetchProxy, req: UniLLM.ChatRequest & { stream?: false }): Promise<UniLLM.NonStreamResponse>;
    async post(fetch: FetchProxy, req: UniLLM.ChatRequest): Promise<UniLLM.Response> {
        const input_messages = this.formInputMessageSeq(req);
        const headers = this.buildHeaders(req);
        const params = this.buildParams(input_messages, req);

        dev_log('===params===');
        dev_log(params);
        dev_log('===messages===');
        dev_log(params.messages);
        dev_log('===contents===');
        for (const msg of params.messages) dev_log(msg.content);

        const [res, err] = await tryCatch<Response>(
            fetch(GrokAdapter.ChatCompletionURL, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            }));

        if (err) throw err;

        if (!res.ok) {
            console.error('Grok API Error:', await res.text());
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        // Stream mode: 回傳 ReadableStream
        if (req.stream) {
            dev_log(`Response headers: ${res.headers.get('content-type')}`);
            if (!res.body) throw new Error('No stream body');
            return { stream: this.parseSSEStream(res.body) };
        }

        // Non-stream mode: 解析 JSON 並回傳 content
        const data: GrokChatCompletion = await res.json() as GrokChatCompletion;

        if (isDev) console.log('Grok API Response:', JSON.stringify(data, null, 2));

        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in response');

        return { content } as UniLLM.NonStreamResponse;
    }

    async *parseSSEStream(
        stream: ReadableStream
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        const reader = stream.getReader();
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
                    if (!line.trim()) continue;
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6);
                    if (data === '[DONE]') return;

                    try {
                        const json = JSON.parse(data);
                        const choice0 = json.choices[0];

                        if ('usage' in json) { // usage
                            yield { usage: json.usage }
                            continue;
                        }

                        if (!choice0) { // idk what this can be
                            console.log('no choice 0:', json);
                            continue;
                        }

                        const delta = choice0.delta;
                        let yielded: boolean = false;

                        if (isDev) {
                            // console.log('=====internal=====');
                            // console.log(json);
                            // console.log('========');
                            // console.log(json.choices?.[0]);
                            // console.log('==================');
                        }

                        if (!delta) {// usage chunk
                            yield { usage: json.usage };
                            // console.warn('No delta in chunk:', json);
                            continue;
                        }

                        // console.log('in adapter:', delta);

                        if ('role' in delta) {
                            yield { role: UniLLM.Role.SELF };
                            yielded = true;
                        }
                        if ('content' in delta) {
                            yield { content: delta.content as string };
                            yielded = true;
                        }
                        if ('reasoning_content' in delta) {
                            yield { reasoning: delta.reasoning_content };
                            yielded = true;
                        }
                        if ('finish_reason' in choice0) {
                            yield {
                                finish_reason: choice0.finish_reason,
                                // citations: json.citations || undefined
                            };
                            yielded = true;
                        }
                        if (!yielded) {
                            console.warn(chalk.red('Unprocessed chunk:'), delta);
                            console.warn('choice 0:', json.choices[0]);
                        }
                    } catch (err) {
                        console.error('Failed to parse SSE chunk:', data, err);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
    //#endregion

    protected * formInputMessageSeq(
        req: UniLLM.ChatRequest
    ): Generator<UniLLM.InputMessage> {
        yield* req.system_prompts;
        yield* req.dc_messages;
    }

    protected buildHeaders(req: UniLLM.ChatRequest): Record<string, string> { return {} }

    protected buildParams(
        input_messages: IterableIterator<UniLLM.InputMessage>,
        req: UniLLM.ChatRequest
    ): GrokPostParams<GrokModelInfo> {
        const messages = Array.from(this.transformMessages(input_messages, req));

        return {
            model: this.model_info.Name,
            messages,
            search_parameters: req.web_search ? undefined : {},
            stream: req.stream,
            stream_options: { include_usage: (req.stream && req.stream_include_usage) ?? false }
        }
    };

    protected * transformMessages(
        messages: IterableIterator<UniLLM.InputMessage>,
        req: UniLLM.ChatRequest
    ): Generator<GrokSupportedMessageParam> {
        for (const message of messages)
            switch (message.role) {
                case UniLLM.Role.USER:
                case UniLLM.Role.BOT:
                    const content: GrokContentPart[] = [];
                    // Add text
                    content.push(...this.toTextContent(message.obj));
                    // Filter and add supported media
                    content.push(...this.toMediaContent(this.collectMedia(message.obj, req))
                        .filter(content => this.model_info.Modalities.ImageInput /* && content.type === 'image_url' */));
                    if (content.length > 0)
                        yield { role: 'user', content, name: message.obj.author.username };
                    break;
                case UniLLM.Role.SELF:
                    yield { role: 'assistant', content: message.content };
                    break;
                case UniLLM.Role.SYSTEM:
                    yield { role: 'system', content: message.content };
                    break;
            }
    }
    // #region Content
    protected * toTextContent(message: GuildMessage): Generator<GrokContentPart> {
        if (message.content.length > 0) yield { type: 'text', text: message.content };
    }
    protected * collectMedia(message: GuildMessage, req: UniLLM.ChatRequest): Generator<GrokMedia> {
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

// #region Adapter Registry
class Grok_4 extends GrokAdapter { readonly model_info = grok_4_info; }
class Grok_4_fast_reasoning extends GrokAdapter { readonly model_info = grok_4_fast_reasoning_info; }
class Grok_3_mini extends GrokAdapter { readonly model_info = grok_3_mini_info; }
class Grok_4_1_fast_reasoning extends GrokAdapter { readonly model_info: GrokModelInfo = grok_4_1_fast_reasoning_info; }

export class Grok {
    private constructor() { }

    static readonly _4 = new Grok_4();
    static readonly _4_fast_reasoning = new Grok_4_fast_reasoning();
    static readonly _3_mini = new Grok_3_mini();
    static readonly _4_1_fast_reasoning = new Grok_4_1_fast_reasoning();
}
// #endregion

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
        readonly request: UniLLM.RPM<number> | UniLLM.RPS<number> | null,
        readonly token: UniLLM.TPM<number> | null
    };

    readonly Pricing: UniLLM.Pricing;
    readonly HighPricing: Partial<UniLLM.Pricing>;
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
        sources: string[],
        to_date: string
    }>,
    web_search_options: { search_context_size: 'low' | 'medium' | 'high', },
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