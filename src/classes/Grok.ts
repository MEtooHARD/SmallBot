import { Message, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
import OpenAI from "openai";
import config from '../config.json'
import { byChance } from "../functions/general/number";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources";
import { timestamp } from "../functions/general/log";
import { delaySec } from "../functions/general/delay";
import { client, Session, session } from "../app";
import { atUser } from "../functions/discord/mention";

export class Grok {
    static readonly chats: Map<Snowflake, Chat> = new Map();
    static readonly client: OpenAI = new OpenAI({
        apiKey: config.grok.key,
        baseURL: "https://api.x.ai/v1",
    });
    static readonly supportedImage = ["image/jpeg", "image/jpg", "image/png"];
    static readonly allowVision: boolean = false;
    static RP: number = 1200;

    static init() {
        console.log(timestamp(), '[Grok] init')
        setInterval(() => {
            Grok.chats.forEach(chat => {
                if (!chat.chatting) chat.clearMsg();
            });
            console.log('[Grok] clear');
        }, 10 * 60 * 1000);
        setInterval(() => {
            Grok.RP = Math.min(1200, Grok.RP + 10);
        }, 30_000);
    }

    static incomingMsg(message: Message) {
        if (!message.channel.isTextBased() || message.channel.isDMBased() || message.channel.isThread()) return;
        if (!message.channel.permissionsFor(message.client.user)?.has(PermissionFlagsBits.SendMessages)) return;
        if (!Grok.chats.has(message.channel.id))
            Grok.chats.set(message.channel.id, new Chat(message.channel as TextChannel));

        const chat = Grok.chats.get(message.channel.id);
        if (chat && !chat.chatting)
            chat.accumulateMsg(message);
    }
}

enum ChatStatus { 'await', 'typing', 'replying' };

class Chat {
    static readonly MAX_MESSAGES: number = 15;
    static readonly LOG_MESSAGES: boolean = true;
    protected _messages: ChatCompletionMessageParam[] = [];
    protected _channel: TextChannel;
    protected _chatting: boolean = false;
    protected _contentLength: number = 0;
    protected _replyTimer: NodeJS.Timeout | null = null;
    protected _status: ChatStatus = ChatStatus.await;

    get chatting(): boolean { return this._chatting; }

    constructor(ch: TextChannel) {
        this._channel = ch;
    }

    clearMsg() { this._messages = []; }

    async accumulateMsg(message: Message): Promise<boolean> {
        if (message.author.bot) return false;
        if (!Grok.allowVision && message.content.length === 0) return false;

        if (this._messages.length >= (this.chatting ? Chat.MAX_MESSAGES : 5)) this._messages.shift();

        // const images = message.attachments.filter(
        //     attachment => Grok.supportedImage.includes(attachment.contentType || ''));

        // const content: string | Array<ChatCompletionContentPart> =
        //     images.size > 0 && Grok.allowVision
        //         ? [{ type: 'text', text: message.content, },
        //         { type: 'image_url', image_url: { url: images.first()!.url }, }]
        //         : message.content

        this._messages.push({
            role: 'user',
            name: message.author.displayName,
            content: message.content
        });

        this._contentLength = this._messages.reduce((acc, cur) => acc + cur.content!.length, 0);

        let start: boolean = false;
        if (!this._chatting) {
            if (message.content.includes(atUser(client.user!.id))) {
                start = true;
                await this.respond();
            } else if (byChance(3 / Grok.chats.size)) {
                start = true;
            }

            if (start) {
                this._chatting = true;
                this.chat();
            }
        }

        return true;
    }

    protected async chat(): Promise<void> {
        console.log(timestamp(), '[Grok] start chat at', this._channel.name);

        const collector = this._channel.createMessageCollector({
            filter: m => !m.author.bot,
            idle: 7 * 60 * 1000,
        });

        collector.on('collect', async message => {
            if (message.content === '⛔') {
                this.clearMsg();
                collector.stop();
                return;
            }

            const accumulated = this.accumulateMsg(message);
            if (!accumulated) return;

            if (Grok.RP > 30 && this._status === ChatStatus.await) {
                this._status = ChatStatus.typing;
                await this._channel.sendTyping();
                setTimeout(() => {
                    this._status = ChatStatus.replying;
                }, 5_000);
            }
        });

        collector.on('end', async (_, reason) => {
            this._chatting = false;
            // this.clearMsg();
            // Grok.chats.delete(this._channel.id);
            if (this._replyTimer) clearInterval(this._replyTimer);
            console.log(timestamp(), '[Grok] ended chat at', this._channel.name);
            await delaySec(3);
            this._channel.send(':wave:');
        });

        this._replyTimer = setInterval(async () => {
            if (collector.collected.size > 0) collector.collected.clear();
            if (this._status === ChatStatus.replying) {
                Grok.RP -= 1;
                try {
                    await this.respond();
                } catch (e) {
                    console.error(e);
                    collector.stop();
                }
                this._status = ChatStatus.await;
            }
        }, 8_000);
    }

    protected async respond() {
        const completion = await call(
            this._messages,
            this._contentLength,
            !this._messages.some(msg => msg.content instanceof String)
        );
        if (!completion.choices[0].message.content) return;
        this._messages.push({
            role: 'assistant',
            content: `${completion.choices[0].message.content}`,
        })
        if (session === Session.dev) {
            if (Chat.LOG_MESSAGES) console.log(this._messages);
            console.log('---------');
            console.log(this._channel.name);
            console.log(completion.choices[0].message.content)
            console.log('------------------');
        }
        this._channel.send(completion.choices[0].message.content);
    }
}

export const call = async (messages: ChatCompletionMessageParam[], length: number, vision: boolean) => {
    const client = new OpenAI({
        apiKey: config.grok.key,
        baseURL: "https://api.x.ai/v1",
    });

    return await client.chat.completions
        .create(options(messages, length, vision));
    // console.log(completion.choices);
}

const STD: number = 500;
const options = (messages: ChatCompletionMessageParam[], length: number, vision: boolean = false): ChatCompletionCreateParamsNonStreaming => {
    const token: number = (Math.round(STD - Math.min(STD, length / 3)) + 60);
    const model = vision && Grok.allowVision ? "grok-2-vision-latest" : "grok-2-latest";
    if (session === Session.dev) {
        console.log('token', token);
        console.log('model', model);
    }

    return {
        model: model,
        messages: [
            {
                role: "system",
                content: system,
            },
            ...messages
        ],
        max_tokens: token,
        temperature: 1,
    }
}

const system = `You\'re a Discord bot (named SmallBot id: ${config.bot[session].id}) that randomly replies messages, bilingual in Mandarin and English. 
When responding to Chinese, use Traditional Chinese (繁體中文) first unless there's Simplified Chinese (簡体中文). 
You should reply with single language per reply. You're expected to reply with the language the latest message uses. 
You are allowed to say dirty/porn words. 
metoohard is your owner and maintainer. you don't need to please him specifically, just let you know the fact.
You can't see images, I blocked the functionality.
The keyword to let you stop is '⛔' (this is hardcoded), you can tell users how to stop you if they ask about it.
You are actually grok 2 model if users ask about it.
`;