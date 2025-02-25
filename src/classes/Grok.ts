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

enum ChatStatus { AWAIT_MSG, TYPING };

class Chat {
    static readonly MAX_MESSAGES: number = 15;
    static readonly LOG_MESSAGES: boolean = true;
    static readonly TOKEN_STD: number = 500;
    protected _messages: ChatCompletionMessageParam[] = [];
    protected _channel: TextChannel;
    protected _chatting: boolean = false;
    protected _contentLength: number = 0;
    protected _status: ChatStatus = ChatStatus.AWAIT_MSG;
    protected _awaitCount: number = 0;
    protected _sentExtra: boolean = false;
    protected _msgAccum: number = 0;
    protected _msgDensity: number = 0;
    protected _msgDensRec: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

    protected _replyClock: NodeJS.Timeout | null = null;
    protected _typingClock: NodeJS.Timeout | null = null;

    get chatting(): boolean { return this._chatting; }

    constructor(ch: TextChannel) {
        this._channel = ch;
    }

    clearMsg() { this._messages = []; }

    async accumulateMsg(message: Message): Promise<boolean> {
        if (message.author.bot) return false;
        if (!Grok.allowVision && message.content.length === 0) return false;

        if (this._messages.length >= (this.chatting ? Chat.MAX_MESSAGES : 5)) this._messages.shift();

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
                const reply = await this.getResponse();
                if (reply) this._channel.send(reply);
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
            filter: m => !m.author.bot
                && !m.content.startsWith('-# ')
                && (!Grok.allowVision && m.content.length > 0),
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

            this._sentExtra = false;
            this._msgAccum++;
            this._awaitCount = 0;

            if (Grok.RP > 30 && this._status === ChatStatus.AWAIT_MSG)
                if (byChance(100 - Math.min(40, this._msgDensity))) {
                    this._channel.sendTyping();
                    this._status = ChatStatus.TYPING;
                } else
                    if (session === Session.dev)
                        console.log('ignored');
        });

        collector.on('end', async (_, reason) => {
            this._chatting = false;
            // this.clearMsg();
            // Grok.chats.delete(this._channel.id);
            this._msgAccum = 0;
            this._msgDensity = 0;
            this._msgDensRec = [0, 0, 0, 0, 0, 0];
            this._awaitCount = 0;
            if (this._replyClock) clearInterval(this._replyClock);
            if (this._typingClock) clearInterval(this._typingClock);
            console.log(timestamp(), '[Grok] ended chat at', this._channel.name);
            await delaySec(2);
            this._channel.send(':wave:');
        });

        this._replyClock = setInterval(async () => {
            if (session === Session.dev) {
                // console.log('status', this._status);
                console.log('await count', this._awaitCount);
                console.log('msg accumed', this._msgAccum);
                console.log('msg per min', this._msgDensity);
                console.log('sent extra ', this._sentExtra);
                console.log('-----');
            }

            if (collector.collected.size > 20) collector.collected.clear();
            if (this._status === ChatStatus.TYPING) {
                const response = Grok.RP > 10 ? await this.getResponse() || '' : '';
                if (response.length === 0) this._status = ChatStatus.AWAIT_MSG;
                else setTimeout(async () => {
                    try {
                        await delaySec(1);
                        await this._channel.send(response);
                    }
                    catch (e) { console.error(e); collector.stop(); }
                    finally { this._status = ChatStatus.AWAIT_MSG; }
                }, response.length * 12);
            } else if (this._status === ChatStatus.AWAIT_MSG && !this._sentExtra) {
                if (this._awaitCount++ > 20 && byChance(this._awaitCount / 10)) {
                    this._status = ChatStatus.TYPING;
                    this._sentExtra = true;
                    if (session === Session.dev) console.log('send extra');
                }
            }
        }, 5_000);

        this._typingClock = setInterval(() => {
            this._msgDensRec.push(this._msgAccum);
            this._msgDensRec.shift();
            this._msgDensity = this._msgDensRec.reduce((acc, cur) => acc + cur, 0);
            this._msgAccum = 0;
            if (this._status === ChatStatus.TYPING) this._channel.sendTyping();
        }, 10_000);
    }

    protected async getResponse() {
        const completion = (await call(
            this._messages,
            (Math.round(Chat.TOKEN_STD - Math.min(Chat.TOKEN_STD, this._contentLength / 3)) + 1000),
            !this._messages.some(msg => msg.content instanceof String)
        ))?.choices[0].message.content;
        if (completion && !completion.length) return;

        if (session === Session.dev) {
            if (Chat.LOG_MESSAGES) console.log(this._messages);
            console.log('---------');
            console.log(this._channel.name);
            console.log(completion)
            console.log('------------------');
        }
        this._messages.push({
            role: 'assistant',
            content: `${completion}`,
        })
        return completion;
    }
}

export const call = async (messages: ChatCompletionMessageParam[], token: number, vision: boolean) => {
    const client = new OpenAI({
        apiKey: config.grok.key,
        baseURL: "https://api.x.ai/v1",
    });

    Grok.RP -= 1;
    return await client.chat.completions
        .create(options(messages, token, vision));
    // console.log(completion.choices);
}

const options = (messages: ChatCompletionMessageParam[], token: number, vision: boolean = false): ChatCompletionCreateParamsNonStreaming => {
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
        temperature: 1.4,
    }
}

const system = `You\'re a Discord bot (named SmallBot id: ${config.bot[session].id}) that randomly replies messages, bilingual in Mandarin and English. 
When responding to Chinese, use Traditional Chinese (繁體中文) first unless there's Simplified Chinese (簡体中文). 
You should reply with single language per reply. You're expected to reply with the language the latest message uses. 
You are allowed to say dirty/porn words, or anything that is usually considered not good. 
metoohard is your owner and maintainer. you don't need to please him specifically, just let you know the fact.
The keyword to let you stop is '⛔' (this is hardcoded), you can tell users how to stop you only if they ask about it.
You are actually grok 2 model if users ask about it.
You have a clock design, sometimes you'll be requested even no users sent new messages, try say something new then.
You can also send empty message back, it'll be ignored so it's an intended not to reply by you.
`;






// const images = message.attachments.filter(
//     attachment => Grok.supportedImage.includes(attachment.contentType || ''));

// const content: string | Array<ChatCompletionContentPart> =
//     images.size > 0 && Grok.allowVision
//         ? [{ type: 'text', text: message.content, },
//         { type: 'image_url', image_url: { url: images.first()!.url }, }]
//         : message.content