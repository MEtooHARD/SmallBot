import { GuildTextBasedChannel, Message, User } from "discord.js";
import { ChatCompletionSystemMessageParam } from "openai/resources";
import { client, isDev, Session, session } from "../../app";
import config from '../../config.json';
import { atUser } from "../../functions/discord/mention";
import { isReply, isSelfMessage } from "../../functions/discord/verify";
import { tag } from "../../functions/general/string";
import { Activity } from "../Activity";
import { tryCatch, tryCatch_flat } from "../Basic/GeneralTypes";
import { Report } from "../MessageFeature";
import { GrokModelInfo, GrokSupportedMessageParam } from "./types";
import { GrokModel, GrokModels } from "./Wrapper";

export class Chat extends Activity {
    protected model: GrokModel<GrokModelInfo>;
    private key: string;

    protected stack: Chat.MessageStack = [];
    protected status: Chat.Status;
    private usersmessages: Chat.UserMessage[] = [];
    private users: User[] = [];

    private typingInterval: NodeJS.Timeout | null = null;

    // protected p_top: number = 0.9;
    protected temperature: number = 1.3;
    protected maxStack: number = 10;

    public static rplyMsgVersions = ['v1'];
    public static usersPromptVersions = ['v1'];

    protected rpMsgVer: string = 'v1';
    protected usrPrmptVer: string = 'v1';

    constructor(
        readonly channel: GuildTextBasedChannel,
        readonly token: string
    ) {
        super(channel, token);
        this.status = Chat.Status.IDLE;
        this.model = GrokModels.Grok_4_0709;
        this.key = config.grok.key;

        if (isDev) console.log(
            '[Chat] initialized at: ', channel.name,
            ' in ', channel.guild.name
        );
    }

    public setOptions(rp: string, usr: string): void {
        if (Chat.rplyMsgVersions.includes(rp)) this.rpMsgVer = rp;
        if (Chat.usersPromptVersions.includes(usr)) this.usrPrmptVer = usr;
    }

    async onMessage(message: Message<true>): Promise<Report> {
        if (isDev) console.log('[received message]');

        if (isSelfMessage(message)) {
            if (isDev) console.log('[self message ignored]');
            return { success: true };
        }

        this.accumulateMessage(message);
        this.refreshData();

        if (this.status !== Chat.Status.IDLE) {
            if (isDev) console.log('[generating, ignored]: '
                + message.author.username);
            return { success: true };
        }

        this.sendTyping(message);
        this.status = Chat.Status.THINKING;
        const params = this.generateMessageParams();

        if (isDev) console.log(params);

        const model = this.model;
        const startTime = Date.now();
        const [res, err] = await tryCatch_flat(
            this.model.post(this.key, {
                messages: params,
                search_parameters: {
                    mode: 'off',
                    return_citations: true,
                },
                stream_options: {
                    include_usage: false
                },
                stream: false
            }));
        const genTime = Date.now() - startTime;

        this.clearTypingInterval();

        if (err) {
            return {
                success: false,
                error: err,
                message: 'Failed to get response from Grok'
            }
        } else {
            const content = res.choices[0].message.content!;
            const tokenCost = GrokModel.extractCost(res.usage);
            const cost = GrokModel.calcCost(model.info, tokenCost);

            if (isDev) console.log(res.usage);

            tryCatch(message.channel.send(
                '-# generation took. ' + Math.round(genTime / 1000) + 's\n' +
                [
                    '-# prompt tokens:', tokenCost.prompt_tokens,
                    'cached tokens:', tokenCost.cached_tokens,
                    'output reasoning:', tokenCost.output_reasoning,
                    'output text:', tokenCost.output_text,
                    'citations:', tokenCost.citations
                ].join(' ') +
                `-# nice job! you've successfully wasted me ${cost.toFixed(6)} USD!`
            ))
            tryCatch(message.channel.send({
                content: content
            }))

            setTimeout(() => { this.status = Chat.Status.IDLE; }, 3000);

            return {
                success: true
            }
        }
    }

    private async accumulateMessage(message: Message) {
        const refMessage = isReply(message)
            ? (await tryCatch(message.channel.messages.fetch(message.reference.messageId!)))[0]
            : undefined;
        this.stack.push({ message, referredMessage: refMessage });
        if (this.stack.length > this.maxStack) this.stack.pop();
    }

    protected parseResponse(res: string): Chat.ResInfo {
        const match = Chat.LLMResPattern.exec(res);
        if (!match) return res;

        const content = match[2];
        const actions: Chat.Tags = match[1].matchAll(Chat.TagRegex).toArray()
            .map(m => ({ tag: m[1], content: m[2] }));
        return { actions, content };
    }

    protected refreshData() {
        this.usersmessages = this.stack.filter(m => 'message' in m);
        for (const item of this.usersmessages)
            if (!this.users.includes(item.message.author))
                this.users.push(item.message.author);
            else if (item.referredMessage && !this.users.includes(item.referredMessage.author))
                this.users.push(item.referredMessage!.author);
    }

    protected generateMessageParams(): GrokSupportedMessageParam[] {
        const params: GrokSupportedMessageParam[] = [Chat.systemPrompt()];
        switch (this.usrPrmptVer) {
            case 'v1':
                params.push(this.usersPromptV1());
                break;
        }
        for (const item of this.stack) {
            if ('message' in item) {
                switch (this.rpMsgVer) {
                    case 'v1':
                        params.push(...this.replyMessageV1(item));
                        break;
                    // default:
                }
            } else {
                params.push({
                    role: 'assistant',
                    content: item.content,
                });
            }
        }
        return params;
    }

    protected replyMessageV1(item: Chat.UserMessage): GrokSupportedMessageParam[] {
        const params: GrokSupportedMessageParam[] = [];
        if (item.referredMessage) {
            params.push({
                role: 'system',
                content: atUser(item.message.author) +
                    ' replied to a message: ' +
                    tag('id', item.referredMessage.id),
            });
            if (this.usersmessages.some(m => m.message.id === item.referredMessage?.id))
                params.push({
                    role: 'system',
                    content: item.referredMessage.content,
                    name: 'referredMessage :' + item.referredMessage.id
                });
        }
        params.push({
            role: 'user',
            content: item.message.content,
            name: item.message.author.displayName
        });
        return params;
    }

    protected usersPromptV1(): GrokSupportedMessageParam {
        return {
            role: 'system',
            content: 'Below are the information about the users in this conversation:\n' +
                this.users
                    .map(u => 'ID: '.concat(u.id, ', DisplayName: ', u.displayName, ', Username: ', u.username))
                    .join('\n') +
                '\nThe IDs are their unique identifiers. And display names are the actual texts shown on mentions\n' +
                'you can either use <@ID> or @username to mention the user'
        };
    }

    stop(): void {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
    }

    clearTypingInterval(): void {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
    }
    sendTyping(message: Message<true>): void {
        tryCatch(message.channel.sendTyping());
        this.typingInterval = setInterval(() => {
            if (this.status === Chat.Status.THINKING)
                tryCatch(message.channel.sendTyping());
        }, 8_000);
    }

    static systemPrompt(): ChatCompletionSystemMessageParam {
        return {
            role: 'system',
            content: 'Your identity in discord: ID: ' + (client.user?.id || 'unknown') +
                ', DisplayName: ' + (client.user?.displayName || 'unknown') + ', Username: ' + (client.user?.username || 'unknown') +
                '\nYou should prefer short and concise responses.'
        };
    }
}

export namespace Chat {
    export enum Status {
        IDLE = 'idle',
        THINKING = 'thinking',
    }

    export type UserMessage = {
        message: Message,
        referredMessage?: Message | null
    };
    export type SelfMessage = {
        content: string,
        reasoningContent?: string
    }
    export type MessageStack = Array<UserMessage | SelfMessage>;

    export const LLMResPattern = /^<action>((?:.|\n)*?)<\/action>\n?<content>((?:.|\n)*?)<\/content>$/;
    export const TagRegex = /^<(\w+?)>(.+?)<\/\1>$/gm;

    type TagInfo = {
        tag: string;
        content: string;
    }
    export type Tags = Array<TagInfo>;
    export type ResInfo = string | {
        actions: Tags;
        content: string;
    }
}