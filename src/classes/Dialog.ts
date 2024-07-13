import { APIEmbed, APIEmbedAuthor, AnySelectMenuInteraction, ButtonInteraction, Colors, CommandInteraction, ComponentType, InteractionReplyOptions, InteractionUpdateOptions, Message } from "discord.js";
import { ButtonOptions } from "./ActionRow/Button";
import { splitArray } from "../functions/general/array";
import ButtonRow from "./ActionRow/ButtonRow";
import { x_min_y_sec } from "../functions/general/string";
import { randomColor } from "../functions/discord/RandomColor";
import { restrictRange } from "../functions/general/number";

export interface Question {
    header: APIEmbed;
    options: ButtonOptions[];
    ephemeral?: boolean;
};

export interface DialogOptions {
    interaction: ButtonInteraction | CommandInteraction | AnySelectMenuInteraction;
    idle?: number;
};

/**
 * instantiate, then use awaitResponse to post a question and await for the returned interaction.
 * DO NOT reply or defer the interaction once instantiated.
 */
export class Dialog {
    private _interaction: ButtonInteraction | CommandInteraction | AnySelectMenuInteraction;
    private _idle: number = 60 * 1000;
    private _message: Message | null = null;
    private _question: Question = {
        header: Dialog.DefultHeader,
        options: []
    };
    private _poster: (i: InteractionReplyOptions) => Promise<Message>;
    private _followUp: (i: InteractionReplyOptions) => Promise<Message>;

    constructor(data: DialogOptions) {
        this._interaction = data.interaction;
        if (data.idle) this.idle = data.idle;
        this._followUp = i => data.interaction.followUp({ ...i, fetchReply: true });

        if (!data.interaction.replied && !data.interaction.deferred)
            this._poster = i => data.interaction.reply({ ...i, fetchReply: true });
        else
            this._poster = i => data.interaction.followUp({ ...i, fetchReply: true });
    };

    awaitResponse(question: Question): Promise<ButtonInteraction> {
        return new Promise(async (resolve, reject) => {
            this._message = await this.post(question);
            const collector = this._message.createMessageComponentCollector<ComponentType.Button>({ max: 1, idle: this._idle });

            collector.on('collect', async (interaction: ButtonInteraction) => {
                resolve(interaction);
                try { await interaction.update(Dialog.RecievedMessage); }
                catch (e) { };
            });

            collector.on('end', async (collected, reason) => {
                if (reason !== 'idle') {
                    console.log(reason);
                } else {
                    reject(reason);
                    try {
                        await this._message?.edit(Dialog.FailedMessage);
                    } catch (e) {
                        await this._followUp({ embeds: [Dialog.TimedOutHeader], ephemeral: true });
                    }
                }
            });
        });
    };

    private async post(question: Question): Promise<Message> {
        this.question = question;
        return await this._poster({
            embeds: [this.banner, this.header],
            components: this.panel,
            ephemeral: this._question.ephemeral
        });
    };

    set question(q: Question) {
        this._question = q;
        this._question.ephemeral = q.ephemeral === undefined ? true : q.ephemeral;
        if (!this.header.color) this.header.color = randomColor();
    };

    get banner(): APIEmbed {
        return {
            author: Dialog.AUTHOR,
            footer: { text: `idle: ${x_min_y_sec(this._idle)}` }
        };
    };

    get header(): APIEmbed { return this._question.header; };

    get panel(): ButtonRow[] {
        return splitArray(this._question.options, 5)
            .map(options => new ButtonRow(options));
    };

    set idle(milliseconds: number) { this._idle = restrictRange(milliseconds, 5 * 1000, 5 * 60 * 1000); };

    static AUTHOR: APIEmbedAuthor = { name: 'Dialog alpha' };

    static DefultHeader: APIEmbed = {
        author: Dialog.AUTHOR,
        description: 'waiting for question...',
        color: Colors.Yellow
    };

    static SucceedHeader: APIEmbed = {
        author: Dialog.AUTHOR,
        description: 'Response returned.',
        color: Colors.Green,
    };

    static RecievedMessage: InteractionUpdateOptions = {
        embeds: [Dialog.SucceedHeader],
        components: []
    };

    static TimedOutHeader: APIEmbed = {
        author: Dialog.AUTHOR,
        description: 'Timed out. dialog failed.',
        color: Colors.Red
    };

    static FailedMessage: InteractionUpdateOptions = {
        embeds: [Dialog.TimedOutHeader],
        components: []
    };
};