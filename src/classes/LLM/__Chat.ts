import { MessageCreateOptions, MessagePayload, SendableChannels } from "discord.js";
import { typing } from "../../functions/discord/messaging";
import { dev_log } from "../../functions/general/log";
import { StatefulProcessor } from "../../utils/StatefulProcessor";
import { ChannelActivity } from "../Activity";
import { GuildMessage } from "../Basic/DiscordTypes";
import { tryCatch } from "../Basic/GeneralTypes";
import { Adapter } from "./__Adapter";
import { UniLLM } from "./__Types";
import { Token } from "./Keyring";
import * as ChunkProcessors from "./ChunkStreamProcessor";

type ChatStatus = 'idle' | 'delay' | 'thinking' | 'summarizing' | 'judging';

export type ChatOptions = {
    adapter: Adapter,
    reasoning_content: boolean,
    // token: Token,
    stream: boolean,
    web_search: boolean,
    show_usage: boolean,
    incremental_history: boolean
}

type Metadata = {
    usage: UniLLM.Usage | null;
    role: UniLLM.Role.SELF | null;
    finish_reason: UniLLM.FinishChunk['finish_reason'] | null;
    content: string | null;
}

export class Chat extends ChannelActivity {
    // #region Static Settings
    protected static readonly TypingInterval = 8000; // ms
    protected static readonly PLAIN_TEXT_LENGTH = 250; // characters
    protected static readonly CODE_TEXT_LENGTH = 500; // characters
    // protected static readonly ;
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
    protected message_history: UniLLM.InputMessage[] = [];
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

    set(options: ChatOptions) { this.options = { ...options }; }

    settings(): ChatOptions { return { ...this.options }; }

    update_token(new_token: Token): void {
        this.token.release();
        this.token = new_token;
    }

    // #region onMessage
    async onMessage(message: GuildMessage): Promise<void> {
        if (this.status !== 'thinking') {
            dev_log(`============Chat============`);
            dev_log(`[${this.options.adapter.model_info.Name}] received from: ${message.author.displayName}`);
            dev_log('Content:', message.content.slice(0, 40));
            dev_log('Files:', message.attachments.size);
        }

        // 1. Filter self message
        if (message.author.id === message.client.user.id) return;
        dev_log(`passed self-check`);

        // 2. Append & Trim message history
        this.arrangeHistory(message);
        dev_log('arranged history');

        // 3. Check if should process
        if (this.status !== 'idle' || !this.message_history.some(m => m.role === UniLLM.Role.USER || m.role === UniLLM.Role.BOT)) return;
        dev_log('passed status-check');

        // 4. Snapshot options
        const streamSnapshot = this.options.stream;

        // 5. Call LLM
        this.status = 'thinking';
        this.typingLoop(message.channel);
        dev_log('calling LLM');
        const [res, err] = await tryCatch(this.options.adapter.post(
            this.token.useFetch,
            {
                dc_messages: this.message_history,
                system_prompts: [{
                    role: UniLLM.Role.SYSTEM, content: 'You are a discord user.'
                }],
                include_images: true,
                include_custom_emoji: true,
                stream: streamSnapshot,
                stream_include_usage: true
            }
        ));

        // 6. Skip & log error
        if (err) {
            dev_log(err);
            this.status = 'idle';
            return;
        }

        // 7. Process & Post to Discord
        dev_log(`============Response===========`);

        if (UniLLM.isStreamResponse(res)) {
            dev_log('Stream response start');

            let stream = res.stream;
            const data: Metadata = { usage: null, role: null, finish_reason: null, content: null };
            const final = Chat.Dispatch(stream, data, this.options);

            for await (const msg_part of final)
                await message.channel.send(msg_part);

            this.message_history.push({
                role: UniLLM.Role.SELF,
                content: data.content as string
            })

            this.status = 'idle';
        } else {
            console.log(res.content);
            await message.channel.send(res.content);
            this.message_history.push({
                role: UniLLM.Role.SELF,
                content: res.content
            });
            this.status = 'idle';
        }
        dev_log(`==============End==============`);
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

    // #region arrangeHistory
    protected arrangeHistory(message: GuildMessage): void {
        // user
        if (!message.author.bot) this.message_history.push({
            role: UniLLM.Role.USER,
            obj: message
        })
        // other bot
        else if (message.author.bot) this.message_history.push({
            role: UniLLM.Role.BOT,
            obj: message
        })
        // trim
        if (this.message_history.length > this.max_history_length)
            this.message_history.shift();
    }
    // #endregion

    protected async typingLoop(channel: SendableChannels): Promise<void> {
        while (this.status === 'thinking')
            await typing(channel, Chat.TypingInterval);
    }

    // #region Dispatcher
    protected static async * Dispatch(
        stream: AsyncIterable<UniLLM.Chunk>,
        metadata: Metadata,
        options: ChatOptions
    ): AsyncGenerator<string | MessagePayload | MessageCreateOptions> {
        const processors: StatefulProcessor<any, any>[] = [];

        const reasoning_filter = new ChunkProcessors.ReasoningFilter();
        if (!options.reasoning_content) processors.push(reasoning_filter);

        const collector = new ChunkProcessors.DataCollector();
        processors.push(collector);

        // const line_assembler = new ChunkProcessors.LineAssembler();
        processors.push(new ChunkProcessors.LineAssembler());

        // const code_processor = new ChunkProcessors.CodeProcessor();
        processors.push(new ChunkProcessors.CodeProcessor());

        // const text_assembler = new ChunkProcessors.PlainTextGroupifier(500);
        processors.push(new ChunkProcessors.PlainTextGroupifier(500));

        // const reasoning_dimmer = new ChunkProcessors.ReasoningDimmer();
        processors.push(new ChunkProcessors.ReasoningDimmer());

        // const transformer = new ChunkProcessors.Chunk2MessageTransformer();
        processors.push(new ChunkProcessors.Chunk2MessageTransformer());

        const pipe = processors.reduce((pi, proc) => pi.pipe(proc));

        for await (const chunk of stream)
            yield* pipe.feed(chunk);
        yield* pipe.flush();

        metadata.usage = collector.get_usage();
        metadata.role = collector.get_role();
        metadata.finish_reason = collector.get_finish_reason();
        metadata.content = collector.get_full_content();
    }
    // #endregion
}
