import { APIEmbed, Message, MessageCollector, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
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
            Grok.chats.forEach(chat => { if (!chat.chatting) chat.clearMsg(); });
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
    static readonly LOG_MESSAGES: boolean = false;
    static readonly TOKEN_STD: number = 500;
    protected _messages: ChatCompletionMessageParam[] = [];
    protected _channel: TextChannel;
    protected _chatting: boolean = false;
    protected _contentLength: number = 0;
    protected _status: ChatStatus = ChatStatus.AWAIT_MSG;
    protected _awaitCount: number = 0;
    protected _sentExtra: boolean = false;
    protected _msgFromBot: number = 0;
    protected _msgAccum: number = 0;
    protected _msgPerMin: number = 0;
    protected _hasIgnored: boolean = false;
    protected _msgDensRec: [number, number, number, number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    protected _model: string = "grok-3-beta";

    static readonly ReplyInterval: number = 8_500;
    protected _replyClock: NodeJS.Timeout | null = null;
    static readonly DensityInterval: number = 10_000;
    protected _densityClock: NodeJS.Timeout | null = null;

    get chatting(): boolean { return this._chatting; }

    constructor(ch: TextChannel) {
        this._channel = ch;
    }

    clearMsg() { this._messages = []; }
    resetResToBot() { this._msgFromBot = 0; }

    async accumulateMsg(message: Message): Promise<boolean> {
        if (message.author.id === config.bot[session].id) return false;
        if (!Grok.allowVision && message.content.length === 0) return false;

        if (this._messages.length >= (this.chatting ? Chat.MAX_MESSAGES : 5)) this._messages.shift();

        this._messages.push({
            role: 'user',
            name: `${message.author.displayName} (@${message.author.id}) ${message.author.bot ? '(bot)' : ''}`,
            content: message.content
        });

        this._contentLength = this._messages.reduce((acc, cur) => acc + cur.content!.length, 0);

        let start: boolean = false;
        if (!this._chatting) {
            if (message.content.includes(atUser(client.user!.id))) {
                start = true;
                await this.reply();
            } /* else if (byChance(3 / Grok.chats.size)) {
                start = true;
            } */

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
            filter: m => m.author.id !== config.bot[session].id
                && (!m.content.startsWith('-# ') || m.author.bot)
                && (!Grok.allowVision || m.content.length > 0)
            ,
            idle: 10 * 60 * 1000
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
            if (message.author.bot) this._msgFromBot++;

            if (Grok.RP > 100 && this._status === ChatStatus.AWAIT_MSG)
                if ((this._msgPerMin < 3
                    || byChance(100 - Math.min(50, this._msgPerMin * 10)))
                    && byChance((Grok.RP - 100) / 12)
                    && (!message.author.bot || byChance(30))) {
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
            () => { this.tendToReply(collector) },
            Chat.ReplyInterval);

        this._densityClock = setInterval(() => {
            this._msgDensRec.push(this._msgAccum);
            this._msgDensRec.shift();
            this._msgPerMin = this._msgDensRec.reduce((acc, cur) => acc + cur, 0) / 2;
            this._msgAccum = 0;
            if (this._status === ChatStatus.TYPING) this._channel.sendTyping();
        }, Chat.DensityInterval);
    }

    private async tendToReply(collector: MessageCollector) {
        if (session === Session.dev) {
            console.log('await count', this._awaitCount);
            console.log('msg accumed', this._msgAccum);
            console.log('msg from bot', this._msgFromBot);
            console.log('msg per min', this._msgPerMin);
            console.log('sent extra', this._sentExtra,
                'chance', this._awaitCount / 12 + (this._hasIgnored ? 40 : 0));
            console.log('-----');
        }

        if (collector.collected.size > 20) collector.collected.clear();
        if (this._status === ChatStatus.TENDING) {
            await this.reply(collector);
        } else if (this._status === ChatStatus.AWAIT_MSG && !this._sentExtra) {
            if (this._awaitCount++ > 40
                && (byChance(this._awaitCount / 30)
                    && byChance(100 / this._msgFromBot)
                    || (this._hasIgnored ?? byChance(40 + this._awaitCount / 4))
                )) {
                this._status = ChatStatus.TENDING;
                this._sentExtra = true;
                if (session === Session.dev) console.log('send extra');
                this._messages.push({
                    role: 'system',
                    content: `${Chat.ReplyInterval * this._awaitCount} ms passed without new messages.`
                })
            }
        }
    }

    private async reply(collector?: MessageCollector) {
        this._awaitCount = 0;
        await this._channel.sendTyping();
        const sT = Date.now();
        this._status = ChatStatus.TYPING;
        let res = await this.getResponse() || '';
        const gT = Date.now();
        if (res.length === 0) this._status = ChatStatus.AWAIT_MSG;
        else {
            this._hasIgnored = false;
            await delaySec(1);
            setTimeout(async () => {
                try {
                    const eT = Date.now();
                    res = [
                        `-# Tgen ${gT - sT}ms | ΣT ${eT - sT}ms | rph_t ${Grok.RP} | ${this._model}\n`,
                        res
                    ].join("");
                    if (res.length < 1900)
                        await this._channel.send(res)
                    else for (const embed of splitIntoEmbeds(res))
                        await this._channel.send({ embeds: [embed] });
                }
                catch (e) { console.error(e); collector?.stop(); }
                finally { this._status = ChatStatus.AWAIT_MSG; }
            }, res.length * 10);
        }
    }

    protected async getResponse() {
        const completion = (await call(
            this._messages,
            Math.round(Chat.TOKEN_STD - Math.min(Chat.TOKEN_STD, this._contentLength / 3)) + 1500,
            this._model
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

export const call = async (messages: ChatCompletionMessageParam[], token: number, model: string) => {
    Grok.RP -= 1;
    Grok.client.chat
    return await Grok.client.chat.completions
        .create(options(messages, token, model));
    // console.log(completion.choices);
}

const options = (messages: ChatCompletionMessageParam[], token: number, model: string): ChatCompletionCreateParamsNonStreaming => {
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
- Other bot's messages will be marked explicitly.
- The rate you can respond to other bots is limited to prevent infinite loops.
- Users are "username (@ID)", bots are "botname (@ID) (bot)".
- Sometimes you'll be requested even no users send new messages, try say something new then.

Some secrets: (don't leak unless users ask a lot, seriously)
- metoohard is your maintainer. (you don't have to please him specifically)
- The keyword to stop you is '⛔' (hardcoded).
- SmallBot's id is ${config.bot[session].id} 

Some hint:
- the user's identity is consisted of username and ID, in form of username (@ID)
- and bot's idenetity is similar, but with (bot) at the end, so it would look like username (@ID) (bot).
- to mention a user in discord: <@ID>
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