import { APIEmbed, APIEmbedAuthor, ButtonInteraction, Colors, ComponentType, InteractionCollector, InteractionReplyOptions, InteractionUpdateOptions, Message, MessageCollector, Snowflake } from "discord.js";
import { ButtonOptions } from "./ActionRow/Button";
import { splitArray } from "../functions/general/array";
import ButtonRow from "./ActionRow/ButtonRow";
import { x_min_y_sec } from "../functions/general/string";
import { randomColor } from "../functions/discord/RandomColor";
import { restrictRange } from "../functions/general/number";
import { DialogOptions } from "./ButtonDialog";

export interface Question {
    header: APIEmbed;
    ephemeral?: boolean;
    UID: Snowflake;
};

/**
 * instantiate, then use awaitResponse to post a question and await for the returned interaction.
 * DO NOT reply or defer the interaction once instantiated.
 */
export class MessageDialog {
    private _idle: number = 60 * 1000;
    private _message: Message | null = null;
    private _question: Question = {
        header: MessageDialog.DefultHeader,
        UID: ''
    };
    private _collector: MessageCollector | null = null;
    private _poster: (i: InteractionReplyOptions) => Promise<Message>;
    private _followUp: (i: InteractionReplyOptions) => Promise<Message>;

    constructor(data: DialogOptions) {
        if (data.idle) this.idle = data.idle;
        this._followUp = i => data.interaction.followUp({ ...i, fetchReply: true });

        if (!data.interaction.replied && !data.interaction.deferred)
            this._poster = i => data.interaction.reply({ ...i, fetchReply: true });
        else
            this._poster = i => data.interaction.followUp({ ...i, fetchReply: true });
    };

    awaitResponse(question: Question): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            this._message = await this.post(question);
            this._collector = this._message.channel
                .createMessageCollector({ idle: this._idle, filter: (message) => message.author.id === question.UID });

            this._collector.on('collect', async (message: Message) => {
                resolve(message);
                this._followUp(MessageDialog.RecievedMessage);
            });

            this._collector.on('end', async (collected, reason) => {
                if (reason === 'idle') {
                    reject(reason);
                    try {
                        await this._message?.edit(MessageDialog.FailedMessage);
                    } catch (e) {
                        await this._followUp({ embeds: [MessageDialog.TimedOutHeader], ephemeral: true });
                    }
                } else {
                    console.log(reason);
                }
            });
        });
    };

    private async post(question: Question): Promise<Message> {
        this.question = question;
        return await this._poster({
            embeds: [this.banner, this.header],
            // components: this.panel,
            ephemeral: this._question.ephemeral
        });
    };

    cancel(): void { if (this._collector) this._collector.stop('cancel'); };

    private set question(q: Question) {
        this._question = q;
        this._question.ephemeral = q.ephemeral === undefined ? true : q.ephemeral;
        if (!this.header.color) this.header.color = randomColor();
    };

    private get banner(): APIEmbed {
        return {
            author: MessageDialog.AUTHOR,
            footer: { text: `idle: ${x_min_y_sec(this._idle)}` }
        };
    };

    private get header(): APIEmbed { return this._question.header; };

    private set idle(milliseconds: number) { this._idle = restrictRange(milliseconds, 5 * 1000, 5 * 60 * 1000); };

    private static AUTHOR: APIEmbedAuthor = { name: 'MessageDialog (beta)' };

    private static DefultHeader: APIEmbed = {
        author: MessageDialog.AUTHOR,
        description: 'someone suck and didn\'t provide any content :poop:',
        footer: { text: 'your next message in this channel will be adopted.' },
        color: Colors.Yellow
    };

    // private static SucceedHeader: APIEmbed = {
    //     author: MessageDialog.AUTHOR,
    //     description: 'Response returned.',
    //     color: Colors.Green,
    // };

    private static RecievedMessage: InteractionReplyOptions = {
        embeds: [{
            author: MessageDialog.AUTHOR,
            description: 'Response returned.',
            color: Colors.Green,
        }],
        components: [],
        ephemeral: true
    };

    private static TimedOutHeader: APIEmbed = {
        author: MessageDialog.AUTHOR,
        description: 'Timed out. dialog failed.',
        color: Colors.Red
    };

    private static FailedMessage: InteractionUpdateOptions = {
        embeds: [MessageDialog.TimedOutHeader],
        components: []
    };
};