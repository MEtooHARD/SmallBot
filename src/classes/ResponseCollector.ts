import { ButtonComponent, Colors, ComponentType, InteractionReplyOptions, InteractionResponse, InteractionUpdateOptions, Message, MessageCollectorOptionsParams } from "discord.js";
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

export class Question implements QuestionData {
    readonly title: string;
    readonly description?: string;
    readonly options: ButtonsLayout;
    protected answer: string = '';
    collectorData: MessageCollectorOptionsParams<ComponentType.Button>;
    protected _status: QuestionStatus = QuestionStatus.INIT;
    protected _endReason?: string;

    constructor({
        title,
        options,
        description,
        collectorData
    }: QuestionData) {
        if (options.length === 1 && options[0].length < 1) throw new Error('Must provide at least 1 options');
        this.title = title;
        this.options = options;
        this.description = description;
        this.collectorData = collectorData;
    };

    getMessageOptions(ephemeral: boolean = false): InteractionReplyOptions {
        return {
            flags: ephemeral ? 'Ephemeral' : undefined,
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
        return new Promise<string>((resolve, reject) => {
            const collector = message.createMessageComponentCollector(this.collectorData);

            collector.on('collect', interaction => {
                this.answer = interaction.customId;
                const button = interaction.component as ButtonComponent;
                interaction.update({
                    embeds: [{
                        // author: { name: '' }
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
                    resolve(this.answer);
                else
                    reject(reason);
            });

            this._status = QuestionStatus.SET;
        })
    };

    get status() { return this._status; };

    get endReason() { return this._endReason; };
}

// export class ResponseCollector {
//     protected _questions: Question[] = [];
//     protected _channel: Channel;

//     constructor(channel: Channel) {
//         this._channel = channel;
//     };

//     addQuestion(question: Question) {
//         this._questions.push(question);
//     };

//     async askQuestions() {
//         for (const question of this._questions) {
//             const message = await question.channel.send(question.getMessageOptions());
//             question.onResponse(message);
//         }
//     };

//     getQuestions() {
//         return this._questions;
//     };
// }
