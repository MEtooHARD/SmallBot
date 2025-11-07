import { SendableChannels, Snowflake } from "discord.js";
import { isDev } from "../../app";
import { typing } from "../../functions/discord/messaging";
import { ChannelActivity } from "../Activity";
import { GuildMessage } from "../Basic/DiscordTypes";
import { tryCatch } from "../Basic/GeneralTypes";
import { Adapter } from "./__Adapter";
import { ULLM } from "./__Types";
import { LLMKeyring, Token } from "./Keyring";

type ChatStatus = 'idle' | 'delay' | 'thinking' | 'summarizing' | 'judging';

type StreamStage = 'role' | 'reasoning' | 'content' | 'usage' | 'done';

export type ChatOptions = {
    adapter: Adapter,
    // token: Token,
    stream: boolean,
    web_search: boolean,
    show_usage: boolean,
    incremental_history: boolean
}

export class Chat extends ChannelActivity {
    // #region Static Settings
    protected static readonly TypingInterval = 8000; // ms
    protected static readonly PLAIN_TEXT_LENGTH = 250; // characters
    protected static readonly CODE_TEXT_LENGTH = 500; // characters
    protected static readonly FENCE_START_REGEX = /^```(\w*)$/;
    // #endregion

    readonly name: string = 'Chat';
    protected intervals: NodeJS.Timeout[] = [];
    protected token: Token;
    protected options: ChatOptions;

    // #region Internal
    protected status: ChatStatus;
    // protected model_adapter: Adapter;
    // #endregion


    // #region Model
    protected temperature: number;
    protected top_p: number;
    // protected max_token = 2048;
    // #endregion

    // #region Resource
    protected message_history: ULLM.InputMessage[] = [];
    protected max_history_length: number = 20;
    // #endregion

    // #region Keyring
    // private readonly keyring = LLMKeyring;
    // private readonly provider: ULLM.Providers;
    // private readonly lessee_id: Snowflake;
    // #endregion

    constructor(
        // adapter: Adapter,
        token: Token,
        // provider: ULLM.Providers,
        // lessee_id: Snowflake,
        options: ChatOptions
    ) {
        super();
        this.status = 'idle';
        // this.model_adapter = adapter;
        this.temperature = 1.2;
        this.top_p = 0.9;
        this.token = token;
        // this.provider = provider;
        // this.lessee_id = lessee_id;
        this.options = options;
    }

    set(options: ChatOptions) { this.options = structuredClone(options); }

    settings(): ChatOptions { return structuredClone(this.options); }

    update_token(new_token: Token): void {
        this.token.release();
        this.token = new_token;
    }

    // #region onMessage
    async onMessage(message: GuildMessage): Promise<void> {
        if (isDev && this.status !== 'thinking') {
            console.log(`============Chat============`);
            console.log(`[${this.options.adapter.model_info.Name}] received from: ${message.author.displayName}`);
            console.log('Content:', message.content.slice(0, 40));
            console.log('Files:', message.attachments.size);
        }

        // 1. Filter self message
        if (message.author.id === message.client.user.id) return;
        if (isDev) console.log(`passed self-check`);

        // 2. Append & Trim message history
        this.arrangeHistory(message);
        if (isDev) console.log('arranged history');

        // 3. Check if should process
        if (this.status !== 'idle' || !this.message_history.some(m => m.role === ULLM.Role.USER || m.role === ULLM.Role.BOT)) return;
        if (isDev) console.log('passed status-check');

        // 4. Snapshot options
        const streamSnapshot = this.options.stream;

        // 5. Call LLM
        this.status = 'thinking';
        this.typingLoop(message.channel);
        if (isDev) console.log('calling LLM');
        const [res, err] = await tryCatch(this.options.adapter.post(
            this.token.useFetch,
            {
                dc_messages: this.message_history,
                system_prompts: [{
                    role: ULLM.Role.SYSTEM, content: 'You are a discord user.'
                }],
                include_images: true,
                include_custom_emoji: true,
                stream: streamSnapshot,
                stream_include_usage: true
            }
        ));

        // 6. Skip & log error
        if (err) {
            console.error(err);
            this.status = 'idle';
            return;
        }

        // 7. Process & Post to Discord
        if (isDev) console.log(`============Response===========`);

        if (ULLM.isStreamResponse(res)) {
            console.log('Stream response start');

            let processed_stream = res.stream;
            processed_stream = Chat.GatherWords(processed_stream);
            processed_stream = Chat.MarkCode(processed_stream);
            processed_stream = Chat.GatherCode(processed_stream);
            processed_stream = Chat.GatherLines(processed_stream);

            for await (const chunk of processed_stream) {
                console.log('[CHUNK]:', chunk);
                // if (isDev) {
                //     // if ('content' in chunk) console.log(chunk.content.length);
                //     // if ('reasoning' in chunk) console.log(chunk.reasoning.length);
                // }
                if ('code' in chunk) {
                    // Complete code block: send as file
                    if (chunk.code === 'complete') {
                        const text = 'content' in chunk ? chunk.content : chunk.reasoning;
                        const fileName = `code.${chunk.lang || 'txt'}`;
                        await message.channel.send({
                            files: [{
                                attachment: Buffer.from(text),
                                name: fileName
                            }]
                        });
                        continue;
                    }
                }
                if ('content' in chunk) {
                    if (chunk.content.trim()) // Filter empty strings
                        await message.channel.send(chunk.content);
                }
                else if ('reasoning' in chunk) {
                    const dimmed = chunk.reasoning
                        // .trim()
                        .split('\n')
                        .filter(line => line.trim())
                        .map(line => `-# ${line}`);
                    if (dimmed.length > 0) // Filter empty messages
                        await message.channel.send(dimmed.join('\n'));
                }
            }
            this.status = 'idle';
        } else {
            console.log(res.content);
            await message.channel.send(res.content);
            this.message_history.push({
                role: ULLM.Role.SELF,
                content: res.content
            });
            this.status = 'idle';
        }
        if (isDev) console.log(`===============================`);
    }
    // #endregion
    // #region stop
    stop(): void {
        this.token.release();
        this.intervals.forEach(i => {
            clearInterval(i);
            clearTimeout(i);
        });
    }
    // #endregion

    protected arrangeHistory(message: GuildMessage): void {
        // user
        if (!message.author.bot) this.message_history.push({
            role: ULLM.Role.USER,
            obj: message
        })
        // other bot
        else if (message.author.bot) this.message_history.push({
            role: ULLM.Role.BOT,
            obj: message
        })
        // trim
        if (this.message_history.length > this.max_history_length)
            this.message_history.shift();
    }

    protected async typingLoop(channel: SendableChannels): Promise<void> {
        while (this.status === 'thinking')
            await typing(channel, Chat.TypingInterval);
    }

    // #region GatherTextChunk
    /**
     * Gathers ContentChunk and ReasoningChunk into separate lines by newlines.
     * @param stream 
     */
    protected static async * GatherWords(
        stream: AsyncGenerator<ULLM.Chunk, void, unknown>,
    ): AsyncGenerator<ULLM.Chunk, void, unknown> {
        let prev_stage: StreamStage = 'role';
        let buffer = '';

        for await (const chunk of stream) {
            const { chunk: cur_chunk, stage } = ExtractTypedChunkAndStage(chunk);

            if (isDev) {

            }

            // Stage change: flush buffer
            if (prev_stage !== stage && (prev_stage === 'content' || prev_stage === 'reasoning') && buffer.length > 0) {
                yield TextChunk(buffer, prev_stage);
                buffer = '';
                prev_stage = stage;
            }
            // Pass through non-text chunks
            if (stage === 'done' || stage === 'usage' || stage === 'role') {
                yield cur_chunk;
                continue;
            }
            // Handle text chunks (content or reasoning)
            buffer += stage === 'content' ? cur_chunk.content : cur_chunk.reasoning;

            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep last incomplete line in buffer
            // Yield complete lines
            for (const line of lines)
                if (stage === 'content') yield { content: line };
                else yield { reasoning: line };
        }
    }
    // #endregion
    // #region MarkCode
    /**
     * marks lines as code: start/middle/end according to the presence of code fences so far, otherwise just text (as it is) and
     * @param stream 
     */
    protected static async * MarkCode(
        stream: AsyncGenerator<ULLM.Chunk, void, unknown>,
    ): AsyncGenerator<ULLM.Chunk, void, unknown> {
        let prev_stage: StreamStage = 'role';
        let code_block: boolean = false;
        let lang: string = '';

        // Helper: yield text chunk with optional code metadata
        const C_R_chunk_mark_helper = (
            stage: 'content' | 'reasoning',
            text: string,
            code?: 'start' | 'middle' | 'end',
        ) => {
            const text_part = stage === 'content' ? { content: text } : { reasoning: text };
            return code ? { ...text_part, code, lang } : text_part;
        };

        for await (const chunk of stream) {
            const { chunk: typed_chunk, stage } = ExtractTypedChunkAndStage(chunk);
            const is_text_chunk = (stage === 'content' || stage === 'reasoning');
            // Stage change: reset code block state first
            if (prev_stage !== stage) {
                code_block = false;
                lang = '';
                prev_stage = stage;
                // Non-text chunks: yield as-is
                if (!is_text_chunk) {
                    yield chunk;
                    continue;
                }
                // Text chunks: check for start fence
                const text = stage === 'content' ? typed_chunk.content : typed_chunk.reasoning;
                const start_fence = text.match(Chat.FENCE_START_REGEX);
                if (start_fence) {
                    lang = start_fence[1] || '';
                    code_block = true;
                    yield C_R_chunk_mark_helper(stage, text, 'start');
                } else {
                    yield chunk;
                }
                continue;
            }
            // Stage continues: non-text chunks yield as-is
            if (!is_text_chunk) {
                yield chunk;
                continue;
            }

            const text = stage === 'content' ? typed_chunk.content : typed_chunk.reasoning;
            // Stage continues: check for fence
            const fence = text.match(Chat.FENCE_START_REGEX);
            if (!fence) {
                yield C_R_chunk_mark_helper(stage, text, code_block ? 'middle' : undefined);
            } else {
                if (fence[1]) { // start fence
                    lang = fence[1];
                    code_block = true;
                    yield C_R_chunk_mark_helper(stage, text, 'start');
                } else if (code_block) { // end fence
                    yield C_R_chunk_mark_helper(stage, text, 'end');
                    lang = '';
                    code_block = false;
                } else { // start fence without lang
                    lang = '';
                    code_block = true;
                    yield C_R_chunk_mark_helper(stage, text, 'start');
                }
            }
        }
    }
    // #endregion

    // #region GatherCode
    /**
     * Gathers code chunks (start/middle/end) into complete code blocks.
     * Non-code chunks are passed through unchanged.
     * Incomplete code blocks are also passed through for next layer to handle.
     * @param stream 
     */
    protected static async * GatherCode(
        stream: AsyncGenerator<ULLM.Chunk, void, unknown>,
    ): AsyncGenerator<ULLM.Chunk, void, unknown> {
        let buffer: (ULLM.ContentChunk | ULLM.ReasoningChunk)[] = [];
        let in_code_block = false;
        let code_lang = '';
        let code_stage: 'content' | 'reasoning' | null = null;

        for await (const chunk of stream) {
            const { chunk: typed_chunk, stage } = ExtractTypedChunkAndStage(chunk);

            // Non-text chunks: pass through
            if (stage !== 'content' && stage !== 'reasoning') {
                // Flush incomplete code if any
                if (buffer.length > 0) {
                    for (const c of buffer) yield c;
                    buffer = [];
                    in_code_block = false;
                }
                yield chunk;
                continue;
            }

            const has_code = 'code' in typed_chunk;

            // Not a code chunk: pass through
            if (!has_code) {
                // Flush incomplete code if any
                if (buffer.length > 0) {
                    for (const c of buffer) yield c;
                    buffer = [];
                    in_code_block = false;
                }
                yield chunk;
                continue;
            }

            // Code chunk handling
            const code_type = typed_chunk.code;

            if (code_type === 'start') {
                // Flush previous incomplete code if any
                if (buffer.length > 0) {
                    for (const c of buffer) yield c;
                    buffer = [];
                }
                // Start new code block
                in_code_block = true;
                code_lang = typed_chunk.lang || '';
                code_stage = stage;
                buffer.push(typed_chunk);
            } else if (code_type === 'middle') {
                if (in_code_block) {
                    buffer.push(typed_chunk);
                } else {
                    // Middle without start: pass through
                    yield chunk;
                }
            } else if (code_type === 'end') {
                if (in_code_block) {
                    buffer.push(typed_chunk);
                    // Complete! Combine and yield as 'complete'
                    const combined_text = buffer.map(c =>
                        'content' in c ? c.content : c.reasoning
                    ).join('\n');

                    if (code_stage === 'content') {
                        yield { content: combined_text, code: 'complete', lang: code_lang };
                    } else {
                        yield { reasoning: combined_text, code: 'complete', lang: code_lang };
                    }

                    // Reset
                    buffer = [];
                    in_code_block = false;
                } else {
                    // End without start: pass through
                    yield chunk;
                }
            }
        }

        // Flush incomplete code
        if (buffer.length > 0) {
            for (const c of buffer) yield c;
        }
    }
    // #endregion

    // #region GatherLines
    /**
     * Gathers plain text chunks into bigger chunks based on threshold.
     * Code chunks (with 'code' property) are passed through unchanged.
     * @param stream 
     */
    protected static async * GatherLines(
        stream: AsyncGenerator<ULLM.Chunk, void, unknown>,
    ): AsyncGenerator<ULLM.Chunk, void, unknown> {
        let buffer: (ULLM.ContentChunk | ULLM.ReasoningChunk)[] = [];
        let buffer_length = 0;
        let buffer_stage: 'content' | 'reasoning' | null = null;

        const flushBuffer = function* () {
            if (buffer.length === 0) return;

            const combined_text = buffer.map(c =>
                'content' in c ? c.content : c.reasoning
            ).join('\n');

            if (buffer_stage === 'content') {
                yield { content: combined_text };
            } else {
                yield { reasoning: combined_text };
            }
        };

        for await (const chunk of stream) {
            const { chunk: typed_chunk, stage } = ExtractTypedChunkAndStage(chunk);

            // Non-text chunks: flush and pass through
            if (stage !== 'content' && stage !== 'reasoning') {
                yield* flushBuffer();
                buffer = [];
                buffer_length = 0;
                buffer_stage = null;
                yield chunk;
                continue;
            }

            // Code chunks: flush buffer and pass through
            if ('code' in typed_chunk) {
                yield* flushBuffer();
                buffer = [];
                buffer_length = 0;
                buffer_stage = null;
                yield chunk;
                continue;
            }

            // Stage change: flush old buffer
            if (buffer_stage !== stage) {
                yield* flushBuffer();
                buffer = [];
                buffer_length = 0;
                buffer_stage = stage;
            }

            // Add to buffer
            const text = stage === 'content' ? typed_chunk.content : typed_chunk.reasoning;
            buffer.push(typed_chunk);
            buffer_length += text.length;

            // Flush if exceed threshold
            if (buffer_length >= Chat.PLAIN_TEXT_LENGTH) {
                yield* flushBuffer();
                buffer = [];
                buffer_length = 0;
            }
        }

        // Final flush
        yield* flushBuffer();
    }
    // #endregion
}
// #region Helpers
type ChunkTypeAndStage =
    | { chunk: ULLM.ReasoningChunk, stage: 'reasoning' }
    | { chunk: ULLM.ContentChunk, stage: 'content' }
    | { chunk: ULLM.UsageChunk, stage: 'usage' }
    | { chunk: ULLM.RoleChunk, stage: 'role' }
    | { chunk: ULLM.FinishChunk, stage: 'done' }

function ExtractTypedChunkAndStage(
    chunk: ULLM.Chunk
): ChunkTypeAndStage {
    if ('reasoning' in chunk) {
        return { chunk, stage: 'reasoning' };
    } else if ('content' in chunk) {
        return { chunk, stage: 'content' };
    } else if ('usage' in chunk) {
        return { chunk, stage: 'usage' };
    } else if ('finishReason' in chunk) {
        return { chunk, stage: 'done' };
    } else {
        // 'role' in chunk
        return { chunk, stage: 'role' };
    }
}

const MAX_DISCORD_LENGTH = 2000;

function TextChunk(
    buffer: string,
    stage: 'content' | 'reasoning',
): ULLM.ContentChunk | ULLM.ReasoningChunk {
    if (stage === 'content')
        return { content: buffer };
    return { reasoning: buffer };
}
// #endregion
