import { APIEmbed, ButtonInteraction, ComponentType, InteractionCollector, InteractionUpdateOptions, Message } from "discord.js";
import { ButtonOptions } from "./ActionRow/Button";
import { x_min_y_sec } from "../functions/general/string";
import ButtonRow from "./ActionRow/ButtonRow";
import { splitArray } from "../functions/general/array";

interface Answer {
    customId: string;
    label?: string;
    emoji?: string;
};

interface QuestionData {
    question: string;
    description?: string;
    options: ButtonOptions[];
};

export class Question {
    question: string;
    description: string = '';
    options: ButtonOptions[];
    answer: Answer = { customId: '' };

    set response(ans: string) {
        const option = this.options.find(button => button.customId === ans);
        if (option)
            this.answer = {
                customId: option.customId,
                emoji: option.emoji,
                label: option.label
            };
        else {
            console.log('warning: found no corresponding option');
            this.answer = {
                customId: '404 Not Found',
                label: '404 Not Found'
            };
        }
    };

    constructor(data: QuestionData) {
        this.question = data.question;
        this.options = data.options;
        if (data.description) this.description = data.description;
    };
};

export class ResponseCollector {
    questions: Question[] = [];
    collector: InteractionCollector<ButtonInteraction> | null = null;
    progress: number = 0;
    started: boolean = false;
    idle: number = 60 * 1000;
    reporter: (answer: Answer) => void = () => { };

    constructor(questions: Question[]) { this.questions = questions; };

    start(message: Message, callback: (answer: Answer) => void): void {
        this.reporter = callback;
        this.started = true;
        this.collector = message.createMessageComponentCollector<ComponentType.Button>({ idle: this.idle });

        this.collector.on('collect', async (interaction: ButtonInteraction) => {
            this.reportResponse(interaction.customId);
            this.next();
            if (this.progress < this.questions.length)
                message = await interaction.update({ ...this.UI, fetchReply: true });
            else
                interaction.update(this.review);
        });

        // this.collector.on('end', async (collection) => {

        // });
    };

    stop(): void { if (this.collector) this.collector.stop(); };

    next(): void {
        this.progress++;
        if (this.progress >= this.questions.length) this.stop();

    };

    reportResponse(answer: string): void {
        this.questions[this.progress].response = answer;
        this.reporter(this.questions[this.progress].answer);
    };

    get UI(): InteractionUpdateOptions {
        return {
            embeds: [this.header],
            components: this.panel,
        };
    };

    get header(): APIEmbed {
        return {
            author: { name: ResponseCollector.AUTHOR },
            title: this.questions[this.progress].question,
            description: this.questions[this.progress].description,
            footer: { text: `${this.progress + 1}/${this.questions.length} questions • idle: ${x_min_y_sec(this.idle)}` }
        };
    };

    get panel(): ButtonRow[] {
        return splitArray(this.questions[this.progress].options, 5)
            .map(options => new ButtonRow(options));
    };

    get review(): InteractionUpdateOptions {
        return {
            embeds: [{
                author: { name: ResponseCollector.AUTHOR },
                title: 'Responses Review',
                description: this.questions
                    .map(question => `**${question.question}**: ${question.answer.label || question.answer.emoji}`)
                    .join('\n')
            }],
            components: []
        };
    };

    setIdle(duration: number): ResponseCollector {
        this.idle = duration;
        return this;
    };

    addQuestions(items: Question[]): ResponseCollector {
        this.questions.push(...items);
        return this;
    };

    setQuestions(items: Question[]): ResponseCollector {
        if (this.started) console.log('warning: set questions after started.');
        else this.questions = items;
        return this;
    };

    static AUTHOR = 'Response Collector alpha';
};