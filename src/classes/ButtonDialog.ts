import { APIEmbed, APIEmbedAuthor, AnySelectMenuInteraction, ButtonInteraction, Collector, Colors, CommandInteraction, ComponentType, InteractionCollector, InteractionReplyOptions, InteractionUpdateOptions, Message, ModalSubmitInteraction } from "discord.js";
import { ButtonOptions } from "./ActionRow/Button";
import { splitArray } from "../functions/general/array";
import ButtonRow from "./ActionRow/ButtonRow";
import { x_min_y_sec } from "../functions/general/string";
import { randomColor } from "../functions/discord/RandomColor";
import { restrictRange } from "../functions/general/number";

interface Question {
    header: APIEmbed;
    options: ButtonOptions[];
    ephemeral?: boolean;
    idle?: number;
    minimize?: boolean;
};

export interface DialogOptions {
    interaction: ButtonInteraction | CommandInteraction | AnySelectMenuInteraction | ModalSubmitInteraction;
};

/**
 * instantiate, then use awaitResponse to post a question and await for the returned interaction.
 * DO NOT reply or defer the interaction once instantiated.
 */
export class ButtonDialog {
    private static AUTHOR: APIEmbedAuthor = { name: 'ButtonDialog (beta)' };

    private static DefultHeader: APIEmbed = {
        author: ButtonDialog.AUTHOR,
        description: 'someone suck and didn\'t provide any content :poop:',
        color: Colors.Yellow
    };

    private static SucceedHeader: APIEmbed = {
        author: ButtonDialog.AUTHOR,
        description: 'Response returned.',
        color: Colors.Green,
    };

    private static RecievedMessage: InteractionUpdateOptions = {
        embeds: [ButtonDialog.SucceedHeader],
        components: []
    };

    // private static TimedOutHeader: APIEmbed = {
    //     author: ButtonDialog.AUTHOR,
    //     description: 'Timed out. Buttondialog failed.',
    //     color: Colors.Red
    // };

    // private static FailedMessage: InteractionUpdateOptions = {
    //     embeds: [ButtonDialog.TimedOutHeader],
    //     components: []
    // };

    private _idle: number = 60 * 1000;
    private _message: Message | null = null;
    private _question: Question = {
        header: ButtonDialog.DefultHeader,
        options: []
    };
    private _collector: InteractionCollector<ButtonInteraction> | null = null;
    private _poster: (i: InteractionReplyOptions) => Promise<Message>;
    // private _followUp: (i: InteractionReplyOptions) => Promise<Message>;

    constructor(data: DialogOptions) {
        // this._followUp = i => data.interaction.followUp({ ...i, fetchReply: true });

        if (!data.interaction.replied && !data.interaction.deferred)
            this._poster = i => data.interaction.reply({ ...i, fetchReply: true });
        else if (!data.interaction.deferred)
            this._poster = i => data.interaction.followUp({ ...i, fetchReply: true });
        else
            this._poster = i => data.interaction.editReply(i);
    };

    awaitResponse(question: Question): Promise<ButtonInteraction> {
        if (question.idle) this.setIdle(question.idle);
        return new Promise(async (resolve, reject) => {
            this._message = await this.post(question);
            this._collector = this._message.createMessageComponentCollector<ComponentType.Button>({
                max: 1, idle: this._idle, filter: interaction => interaction.message.id === this._message?.id
            });

            this._collector.on('collect', async (interaction: ButtonInteraction) => {
                try { await interaction.update(ButtonDialog.RecievedMessage); }
                catch (e) { };
                resolve(interaction);
            });

            this._collector.on('end', async (collected, reason) => {
                if (reason === 'idle')
                    reject(reason);
                // try {
                //     await this._message?.edit(ButtonDialog.FailedMessage);
                // } catch (e) {
                //     await this._followUp({ embeds: [ButtonDialog.TimedOutHeader], ephemeral: true });
                // }
                else
                    if (reason !== 'limit') console.log(reason);
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

    cancel(): void { if (this._collector) this._collector.stop('cancel'); };

    private set question(q: Question) {
        this._question = q;
        this._question.ephemeral = q.ephemeral === undefined ? true : q.ephemeral;
        if (!this.header.color) this.header.color = randomColor();
    };

    private get banner(): APIEmbed {
        return {
            author: ButtonDialog.AUTHOR,
            footer: { text: `idle: ${x_min_y_sec(this._idle)}` }
        };
    };

    private get header(): APIEmbed { return this._question.header; };

    private get panel(): ButtonRow[] {
        return splitArray(this._question.options, 5)
            .map(options => new ButtonRow(options));
    };

    private setIdle(milliseconds: number) { this._idle = restrictRange(milliseconds, 5 * 1000, 5 * 60 * 1000); };
};