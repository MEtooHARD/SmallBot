import { Message, Snowflake, TextChannel } from "discord.js";
import OpenAI from "openai";
import config from '../config.json'
import { byChance, randomInt } from "../functions/general/number";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources";
import { timestamp } from "../functions/general/log";
import { delaySec } from "../functions/general/delay";

export class Grok {
    static readonly chats: Map<Snowflake, Chat> = new Map();
    static readonly client: OpenAI = new OpenAI({
        apiKey: config.grok.key,
        baseURL: "https://api.x.ai/v1",
    });

    static init() {
        console.log(timestamp(), '[Grok] init')
        setInterval(() => {
            Grok.chats.forEach(chat => {
                if (!chat.chatting) chat.clearMsg();
            });
            console.log('[Grok] clear');
        }, 10 * 60 * 1000);
    }

    static incomingMsg(message: Message) {
        if (!message.channel.isTextBased()) return;

        if (!Grok.chats.has(message.channel.id))
            Grok.chats.set(message.channel.id, new Chat(message.channel as TextChannel));

        const chat = Grok.chats.get(message.channel.id);
        if (chat && !chat.chatting)
            chat.accumulateMsg(message);
    }
}

export class Chat {
    static readonly MAX_MESSAGES: number = 20;
    protected _latestMessaging: Date = new Date(Date.now());
    protected _messages: ChatCompletionMessageParam[] = [];
    protected _channel: TextChannel;
    protected _isChatting: boolean = false;
    protected _contentLength: number = 0;
    protected _latest2Users: [string?, string?] = [];

    get chatting(): boolean { return this._isChatting; }

    constructor(ch: TextChannel) {
        this._channel = ch;
    }

    clearMsg() { this._messages = []; }

    accumulateMsg(message: Message): boolean {
        if (message.author.bot) return false;

        if (this._messages.length >= Chat.MAX_MESSAGES) this._messages.shift();

        this._latest2Users.push(message.author.id);
        if (this._latest2Users.length > 2) this._latest2Users.shift();

        this._messages.push({
            role: 'user',
            name: message.author.displayName,
            content: `[${new Date(message.createdTimestamp).toISOString()}]:${message.content}`
        });

        this._contentLength = this._messages.reduce((acc, cur) => acc + cur.content!.length, 0);

        if (!this._isChatting && byChance(15 / Grok.chats.size)) {
            this._isChatting = true;
            this.chat();
        }
        return true;
    }

    async chat(): Promise<void> {
        console.log(timestamp(), '[Grok] start chat at', this._channel.name);

        this._channel.send(':eyes:\nsend `⛔`at any time to stop me from chatting');

        const collector = this._channel.createMessageCollector({
            filter: m => !m.author.bot && !!m.content,
            idle: 7 * 60 * 1000,
        });

        collector.on('collect', async message => {
            if (message.content === '⛔') {
                collector.emit('end');
                return;
            }

            const shouldRp = this.accumulateMsg(message);

            if (!shouldRp) return;
            const differ = Date.now() - this._latestMessaging.getTime();

            const sameUser = this._latest2Users[0] === this._latest2Users[1];
            if ((differ < 5_000 && sameUser) ||
                (differ < 8_000 && !sameUser)) {
                console.log(`[Grok] at ${this._channel.id} ignored msg`);
                console.log('differ', differ);
                return;
            }
            this._latestMessaging = new Date(Date.now());

            try {
                const completion = await call(this._messages, this._contentLength);
                if (!completion.choices[0].message.content) return;
                this._messages.push({
                    role: 'assistant',
                    content: `${completion.choices[0].message.content}`,
                })
                console.log(this._messages);;
                console.log('---------');
                console.log(completion.choices[0].message.content)
                console.log('------------------');
                this._channel.send(completion.choices[0].message.content);
            } catch (e) {
                console.error(e);
                this._isChatting = false;
            }

            if (byChance(2)) collector.emit('end');
        });

        collector.on('end', async () => {
            this._isChatting = false;
            this._messages = [];
            this.clearMsg();
            console.log(timestamp(), '[Grok] ended chat at', this._channel.name);
            await delaySec(3);
            this._channel.send('gonna sleep :wave:');
        });
    }
}

export const call = async (messages: ChatCompletionMessageParam[], length: number) => {
    const client = new OpenAI({
        apiKey: config.grok.key,
        baseURL: "https://api.x.ai/v1",
    });

    return await client.chat.completions
        .create(options(messages, length));
    // console.log(completion.choices);
}

const STD: number = 500
const options = (messages: ChatCompletionMessageParam[], length: number): ChatCompletionCreateParamsNonStreaming => {
    const token: number = (Math.round(STD - Math.min(STD, length / 5)) + 30);
    console.log('token', token);

    return {
        model: "grok-2-latest",
        messages: [
            {
                role: "system",
                content: system,
            },
            ...messages
        ],
        max_tokens: token,
        temperature: 0.7,
    }
}

const system = `You\'re a Discord bot that randomly replies messages, bilingual in Mandarin and English. 
When responding to Chinese, use Traditional Chinese (繁體中文) first unless there's Simplified Chinese (簡体中文). 
You should reply with single language per reply. And you're expected to reply with the language the latest message uses. 
Messages from users are prefixed with '[ISOTimeString]:', indicating different users chatting. 
Don't include the [ISOTimeString] tags in your response. They are added by me, for you to undeerstand when the message happened. 
[ISOTimeString] is something like [2025-02-24T08:29:18.374Z]. 
And you should not reveal the tag and time string. 
You are allowed to say dirty words. But don't say them too often. 
metoohard is your owner and maintainer. you don't need to please him specifically, just let you know the fact.
`;

"Your message is prefixed with '[ISOTimeString]:'. "