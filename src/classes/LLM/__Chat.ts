import { isDev } from "../../app";
import { ChannelActivity } from "../Activity";
import { GuildMessage } from "../Basic/DiscordTypes";
import { tryCatch } from "../Basic/GeneralTypes";
import { Adapter } from "./__Adapter";
import { ULLM } from "./__Types";


type ChatStatus = 'idle' | 'delay' | 'thinking' | 'summarizing' | 'judging';


export class Chat extends ChannelActivity {
    readonly name: string = 'Chat';
    protected intervals: NodeJS.Timeout[] = [];
    protected key: Key;

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
    protected message_history: ULLM.InputMessage[] = [];
    protected max_history_length: number = 20;
    // #endregion

    constructor(adapter: Adapter, key: Key[]) {
        super();
        this.status = 'idle';
        this.model_adapter = adapter;
        this.temperature = 1.2;
        this.top_p = 0.9;
        this.keys = keys;
    }

    async onMessage(message: GuildMessage): Promise<void> {
        // ignore self message
        if (message.author.id === message.client.user.id) return;

        // #region accumulate message
        // user
        if (!message.author.bot)
            this.message_history.push({
                role: ULLM.Role.USER,
                obj: message
            })
        // other bot
        else if (message.author.bot)
            this.message_history.push({
                role: ULLM.Role.BOT,
                obj: message
            })
        if (this.message_history.length > this.max_history_length)
            this.message_history.shift();
        // #endregion
        if (this.status === 'idle' && this.message_history.length > 0) {
            // #region POST
            if (isDev) console.log('===========================');
            this.status = 'thinking';
            const [res, err] = await tryCatch(this.model_adapter.post({
                key: this.keys[0],
                dc_messages: this.message_history,
                system_prompts: [{
                    role: ULLM.Role.SYSTEM, content: 'You are a discord user.'
                }],
                include_images: true,
                include_custom_emoji: true,
            }));
            // #endregion
            if (res) {
                await message.channel.send(res.content);
                this.message_history.push({
                    role: ULLM.Role.SELF,
                    content: res.content
                });
            }

            if (err) {
                console.error(err);
            }
        }
        this.status = 'idle';
    }

    stop(): void {
        this.intervals.forEach(i => {
            clearInterval(i);
            clearTimeout(i);
        });
    }


}