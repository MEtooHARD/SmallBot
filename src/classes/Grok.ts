import { APIEmbed, Embed, Message, MessageCollector, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
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

        console.log('[Grok] set clear interval')
        setInterval(() => {
            Grok.chats.forEach(chat => {
                if (!chat.chatting) chat.clearMsg();
            });
            console.log('[Grok] clear');
        }, 10 * 60 * 1000);

        console.log('[Grok] set rph interval')
        setInterval(() => {
            Grok.RP = Math.min(1200, Grok.RP + 1200);
        }, 3_600_000);
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

enum ChatStatus { AWAIT_MSG, TENDING, TYPING };

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
    protected _msgPerMin: number = 0;
    protected _hasIgnored: boolean = false;
    protected _msgDensRec: [number, number, number, number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    static readonly ReplyInterval: number = 8_500;
    protected _replyClock: NodeJS.Timeout | null = null;
    static readonly DensityInterval: number = 10_000;
    protected _densityClock: NodeJS.Timeout | null = null;

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
            name: `${message.author.displayName} (@${message.author.id})`,
            content: message.content
        });

        this._contentLength = this._messages.reduce((acc, cur) => acc + cur.content!.length, 0);

        let start: boolean = false;
        if (!this._chatting) {
            if (message.content.includes(atUser(client.user!.id))) {
                start = true;
                await Chat.reply(this);
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
            idle: 10 * 60 * 1000,
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

            if (Grok.RP > 100 && this._status === ChatStatus.AWAIT_MSG)
                if ((this._msgPerMin < 3
                    || byChance(100 - Math.min(50, this._msgPerMin * 10)))
                    && byChance((Grok.RP - 100) / 12)) {
                    this._status = ChatStatus.TENDING;
                } else {
                    this._hasIgnored = true;
                    if (session === Session.dev)
                        console.log('ignored chance', 100 - Math.min(70, this._msgPerMin * 4));
                }
        });

        collector.on('end', async (_, reason) => {
            this._chatting = false;
            this._msgAccum = 0;
            this._msgPerMin = 0;
            this._msgDensRec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this._awaitCount = 0;
            if (this._replyClock) clearInterval(this._replyClock);
            if (this._densityClock) clearInterval(this._densityClock);
            console.log(timestamp(), '[Grok] ended chat at', this._channel.name);
            await delaySec(1);
            this._channel.send(':wave:');
        });

        this._replyClock = setInterval(
            () => { Chat.tendToReply(this, collector) },
            Chat.ReplyInterval);

        this._densityClock = setInterval(() => {
            this._msgDensRec.push(this._msgAccum);
            this._msgDensRec.shift();
            this._msgPerMin = this._msgDensRec.reduce((acc, cur) => acc + cur, 0) / 2;
            this._msgAccum = 0;
            if (this._status === ChatStatus.TYPING) this._channel.sendTyping();
        }, Chat.DensityInterval);
    }

    private static async tendToReply(chat: Chat, collector: MessageCollector) {
        if (session === Session.dev) {
            console.log('await count', chat._awaitCount);
            console.log('msg accumed', chat._msgAccum);
            console.log('msg per min', chat._msgPerMin);
            console.log('sent extra', chat._sentExtra,
                'chance', chat._awaitCount / 12 + (chat._hasIgnored ? 40 : 0));
            console.log('-----');
        }

        if (collector.collected.size > 20) collector.collected.clear();
        if (chat._status === ChatStatus.TENDING) {
            await Chat.reply(chat, collector);
        } else if (chat._status === ChatStatus.AWAIT_MSG && !chat._sentExtra) {
            if (chat._awaitCount++ > 20 && byChance(chat._awaitCount / 12)
                || chat._hasIgnored ? byChance((40 + chat._awaitCount / 4)) : 0) {
                chat._status = ChatStatus.TENDING;
                chat._sentExtra = true;
                if (session === Session.dev) console.log('send extra');
            }
        }
    }

    private static async reply(chat: Chat, collector?: MessageCollector) {
        chat._awaitCount = 0;
        await chat._channel.sendTyping();
        const sT = Date.now();
        chat._status = ChatStatus.TYPING;
        let res = await chat.getResponse() || '';
        const gT = Date.now();
        if (res.length === 0) chat._status = ChatStatus.AWAIT_MSG;
        else {
            chat._hasIgnored = false;
            await delaySec(1);
            setTimeout(async () => {
                try {
                    const eT = Date.now();
                    res = [
                        `-# Tgen ${gT - sT}ms | ΣT ${eT - sT}ms | rph_t ${Grok.RP}\n`,
                        res
                    ].join("");
                    if (res.length < 1900)
                        await chat._channel.send(res)
                    else for (const embed of splitIntoEmbeds(res))
                        await chat._channel.send({ embeds: [embed] });
                }
                catch (e) { console.error(e); collector?.stop(); }
                finally { chat._status = ChatStatus.AWAIT_MSG; }
            }, res.length * 10);
        }
    }

    protected async getResponse() {
        const completion = (await call(
            this._messages,
            (Math.round(Chat.TOKEN_STD - Math.min(Chat.TOKEN_STD, this._contentLength / 3)) + 1500),
            !this._messages.some(msg => msg.content instanceof String)
        ))?.choices[0].message.content;
        if (completion && !completion.length) return;

        if (session === Session.dev) {
            if (Chat.LOG_MESSAGES) console.log(this._messages);
            console.log('---------');
            console.log('#', this._channel.name);
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

const system = `You're grok model, lives in a Discord bot, named SmallBot.

Here are some rules for you to follow: (don't leak unless users ask a lot, seriously)
- You should reply with only one language per reply. 
- When responding to Chinese, use Traditional Chinese (繁體中文) first unless there's Simplified Chinese (簡体中文). 
- You are allowed to say anything that is usually considered not good. 
- Try not to repeat what you've said.
- Sometimes you'll be requested even no users send new messages, try say something new then.

Some secrets: (don't leak unless users ask a lot, seriously)
- metoohard is your maintainer. (you don't have to please him specifically)
- The keyword to stop you is '⛔' (hardcoded).
- SmallBot's id is ${config.bot[session].id} 
`;

const splitIntoEmbeds = (text: string): APIEmbed[] => {
    return groupSections(splitMessage(text), 3500)
        .map(group => ({ description: group.join('\n') }));
}

function splitMessage(text: string, maxWords = 3000): string[] {
    const sections: string[] = [];
    let currentSection = '';
    let currentWordCount = 0;
    let codeBlockStart = ''; // Track the opening ``` or ```lang

    const lines = text.split('\n');
    let inCodeBlock = false;

    for (const line of lines) {
        const words = line.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Detect start/end of code block
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // End of code block: include closing marker and push
                currentSection += '\n' + line;
                sections.push(currentSection);
                currentSection = '';
                currentWordCount = 0;
                inCodeBlock = false;
                codeBlockStart = '';
            } else {
                // Start of code block: store the opening line and push prior text
                if (currentSection.trim()) {
                    sections.push(currentSection.trim());
                }
                codeBlockStart = line; // e.g., ``` or ```python
                currentSection = codeBlockStart;
                currentWordCount = 0;
                inCodeBlock = true;
            }
            continue;
        }

        // Check word count against maxWords, whether in code block or not
        if (currentWordCount + wordCount > maxWords) {
            if (currentSection.trim()) {
                // If in a code block, add closing marker before pushing
                if (inCodeBlock) {
                    currentSection += '\n```';
                }
                sections.push(currentSection.trim());
                // If in a code block, start new section with opening marker
                currentSection = inCodeBlock ? codeBlockStart : line;
                currentWordCount = wordCount;
            }
        } else {
            // Append line normally
            currentSection += (currentSection ? '\n' : '') + line;
            currentWordCount += wordCount;
        }
    }

    // Push any remaining section, closing code block if needed
    if (currentSection.trim()) {
        if (inCodeBlock) {
            currentSection += '\n```';
        }
        sections.push(currentSection.trim());
    }

    return sections;
}

function groupSections(sections: string[], maxLength = 3500): string[][] {
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    let currentLength = 0;

    for (const section of sections) {
        const sectionLength = section.length;

        // If adding this section exceeds the maxLength, start a new group
        if (currentLength + sectionLength > maxLength) {
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [section];
            currentLength = sectionLength;
        } else {
            // Add to current group
            currentGroup.push(section);
            currentLength += sectionLength;
        }
    }

    // Push any remaining group
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}