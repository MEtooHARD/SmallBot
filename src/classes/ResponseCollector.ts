import { ButtonComponent, Colors, ComponentType, InteractionReplyOptions, InteractionResponse, MessageCollectorOptionsParams, Snowflake, InteractionCallbackResponse, InteractionUpdateOptions, Message } from "discord.js";
import { ButtonOptions } from "./ActionRow/Button";
import ButtonRow from "./ActionRow/ButtonRow";

type ButtonsRow = [ButtonOptions]
    | [ButtonOptions, ButtonOptions]
    | [ButtonOptions, ButtonOptions, ButtonOptions]
    | [ButtonOptions, ButtonOptions, ButtonOptions, ButtonOptions]
    | [ButtonOptions, ButtonOptions, ButtonOptions, ButtonOptions, ButtonOptions];

type ButtonsLayout = [ButtonsRow]
    | [ButtonsRow, ButtonsRow]
    | [ButtonsRow, ButtonsRow, ButtonsRow]
    | [ButtonsRow, ButtonsRow, ButtonsRow, ButtonsRow]
    | [ButtonsRow, ButtonsRow, ButtonsRow, ButtonsRow, ButtonsRow];

export interface QuestionData {
    readonly title: string;
    readonly description?: string;
    readonly options: ButtonsLayout;
    collectorData: MessageCollectorOptionsParams<ComponentType.Button>;
}

export enum QuestionStatus { INIT, SET, CLOSED }

type Answer = {
    userId: Snowflake;
    text: string;
}

export class Question implements QuestionData {
    readonly title: string;
    readonly description?: string;
    readonly options: ButtonsLayout;
    protected readonly answers: Answer[] = [];
    collectorData: MessageCollectorOptionsParams<ComponentType.Button>;
    protected _status: QuestionStatus = QuestionStatus.INIT;
    protected _endReason?: string;

    constructor({
        title,
        options,
        description,
        collectorData
    }: QuestionData) {
        this.title = title;
        this.options = options;
        this.description = description;
        this.collectorData = collectorData;
    };

    getMessageOptions(): InteractionReplyOptions & InteractionUpdateOptions {

        return {
            embeds: [{
                color: Colors.Blurple,
                title: this.title,
                description: this.description,
                footer: {
                    text: `time limit: ${this.collectorData.time
                        ? this.collectorData.time / 1000 + 's'
                        : 'no'}`
                }
            }],
            components: this.options.map(row => new ButtonRow(row))
        }
    };

    onResponse(message: Message | InteractionResponse) {
        return new Promise<Answer[]>((resolve, reject) => {

            const collector = message.createMessageComponentCollector(this.collectorData);

            collector.on('collect', interaction => {
                this.answers.push({ userId: interaction.user.id, text: interaction.customId });
                const button = interaction.component as ButtonComponent;
                interaction.update({
                    embeds: [{
                        color: Colors.Green,
                        title: this.title,
                        description: this.description,
                        fields: [{
                            name: 'Chosen',
                            value: (button.label || button.emoji?.name)!
                        }]
                    }],
                    components: []
                });
            });

            collector.on('end', (collected, reason) => {
                this._endReason = reason;
                this._status = QuestionStatus.CLOSED;
                if (reason === 'limit')
                    resolve(this.answers);
                else
                    reject(reason);
            });

            this._status = QuestionStatus.SET;
        })
    };

    get status() { return this._status; };

    get endReason() { return this._endReason; };
}
