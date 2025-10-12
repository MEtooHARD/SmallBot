import { Message } from "discord.js";
import { ChannelActivity } from "../Activity";
import { Adapter } from "./__Adapter";
import { IKEY } from './KEY'


type ChatStatus = 'idle' | 'delay' | 'thinking' | 'summarizing' | 'judging';

export class Chat extends ChannelActivity {
    readonly name: string = 'Chat';
    protected readonly keys: IKEY[] = [];
    protected intervals: NodeJS.Timeout[] = [];

    // #region Internal
    protected status: ChatStatus;
    protected model_adapter: Adapter;
    // #endregion


    // #region Model
    protected temperature: number;
    protected top_p: number;
    // protected max_token = 2048;
    // #endregion

    // #region Resource
    protected message_history: Message[] = [];
    protected max_history_length: number = 20;
    // #endregion

    constructor(adapter: Adapter) {
        super();
        this.status = 'idle';
        this.model_adapter = adapter;
        this.temperature = 1.2;
        this.top_p = 0.9;
    }

    onMessage(message: Message): void {
        // accumulate message
        this.message_history.push(message);
        if (this.message_history.length > this.max_history_length)
            this.message_history.shift();

        // prepare request
        // this.model_adapter.post();
    }

    stop(): void {
        this.intervals.forEach(i => {
            clearInterval(i);
            clearTimeout(i);
        });
    }

}