import { Message, TextChannel } from "discord.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { atUser } from "../../functions/discord/mention";
import { isReply } from "../../functions/discord/verify";
import { tag } from "../../functions/general/string";
import { Activity } from "../Activity";
import { GrokModelInfo } from "./types";
import { GrokModel, GrokModels } from "./Wrapper";

const Grok_4 = new GrokModel(GrokModels.Grok_4_0709);

export class Chat extends Activity {
    protected status: Chat.Status;
    protected temperature: number = 1.3;
    // protected p_top: number = 0.9;
    protected llm: GrokModel<GrokModelInfo>;
    protected messageParams: ChatCompletionMessageParam[] = [];

    constructor(
        readonly channel: TextChannel,
        readonly token: string
    ) {
        super(channel, token);
        this.status = Chat.Status.IDLE;
        this.llm = Grok_4;
    }

    onMessage(message: Message): void {
        if (message.author.bot) return;
        if (message.content === 'stop') {
            message.reply('stopped.');
            this.stop();
            return;
        } else {
            message.reply('reply from Chat');
        }
    }

    private accumulateMessage(message: Message) {
        if (isReply(message)) {
            this.messageParams.push({
                role: 'system',
                content: atUser(message.author) + ' replied to a message: ' + tag('id', message.id),
            })
        }
    }

    stop(): void { }
}

export namespace Chat {
    export enum Status {
        IDLE = 'idle',
        THINKING = 'thinking',
    }
}