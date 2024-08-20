import { APIEmbed, ButtonInteraction, ButtonStyle, CacheType, ComponentType, InteractionCollector, InteractionReplyOptions, InteractionUpdateOptions, Message } from "discord.js";
import ButtonRow from "./ActionRow/ButtonRow"
import { TimeStamp } from "../functions/discord/mention";

enum Operations {
    inc = 'inc',
    dec = 'dec',
    switchR = 'switchR',
    switchL = 'switchL',
    confirm = 'confirm'
};

export class TimeSelector {
    private _time: Date;
    private _index: number = 0;
    private _description: string = '';
    private _idle: number = 60 * 1000;
    private _confirm: boolean = false;
    private _collector: InteractionCollector<ButtonInteraction<CacheType>> | null = null;

    constructor() {
        this._time = new Date()
        this._time.setMilliseconds(0);
        this._time.setSeconds(0);
    };

    stop(): void { if (this._collector) this._collector.stop(); };

    awaitSelect(message: Message, idle?: number): Promise<number> {
        if (idle) this._idle = idle;
        return new Promise((resolve, reject) => {
            this._collector = message.createMessageComponentCollector<ComponentType.Button>({ idle: this._idle });
            this._collector.on('collect', async (interaction: ButtonInteraction) => {
                switch (interaction.customId) {
                    case Operations.inc:
                        this.inc();
                        break;
                    case Operations.dec:
                        this.dec();
                        break;
                    case Operations.switchL:
                        this.switchL();
                        break;
                    case Operations.switchR:
                        this.switchR();
                        break;
                    case Operations.confirm:
                        resolve(this._time.getTime());
                        this._confirm = true;
                        try {
                            await interaction.update({
                                embeds: [this.confirmed()],
                                components: []
                            });
                        } catch (e) { };
                        this.stop();
                        break;
                }

                if (interaction.customId !== Operations.confirm)
                    try {
                        message = await interaction.update({
                            embeds: [this.embed()],
                            fetchReply: true
                        });
                    } catch (e) { };
            });

            this._collector.on('end', async (collected: ButtonInteraction<CacheType>) => {
                if (!this._confirm) {
                    reject('idle');
                    try {
                        await message.edit({
                            embeds: [this.timedout()],
                            components: []
                        });
                    } catch (e) { };
                }
            });
        });
    };

    private adjustTimeBy(diff: number): void {
        switch (this._index) {
            case 0:
                this._time.setFullYear(this._time.getFullYear() + diff);
                break;
            case 1:
                this._time.setMonth(this._time.getMonth() + diff);
                break;
            case 2:
                this._time.setDate(this._time.getDate() + diff);
                break;
            case 3:
                this._time.setHours(this._time.getHours() + diff);
                break;
            case 4:
                this._time.setMinutes(this._time.getMinutes() + diff);
                break;
        }
    };

    private inc(): void { this.adjustTimeBy(1); };

    private dec(): void { this.adjustTimeBy(-1); };

    private setIndex(diff: number): void { this._index = ((this._index + diff) % 5 + 5) % 5; };

    private switchL(): void { this.setIndex(-1); };

    private switchR(): void { this.setIndex(1); };

    private selectorMsg(): InteractionReplyOptions {
        return {
            embeds: [this.embed()],
            components: TimeSelector.panel(),
            // ephemeral: true,
            fetchReply: true
        };
    };

    private embed(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: this._description +
                `\nActive: ` +
                TimeSelector.TimeFields
                    .map((f, i) => i === this._index ? `*\`${f}\`*` : f).join(', '),
            fields: [{
                name: 'Local Time:',
                value: `<t:${this._time.getTime().toString().slice(0, -3)}>`
            }],
            footer: { text: 'idle: 1 min' }
        }
    };

    private setDescription(desc: string): TimeSelector {
        this._description = desc;
        return this;
    };

    private setIdle(duration: number): TimeSelector {
        this._idle = duration;
        return this;
    };

    static panel(): ButtonRow[] {
        return [
            new ButtonRow([
                { customId: 'pad1', style: ButtonStyle.Secondary, label: '\u200b', disabled: true },
                { customId: Operations.inc, style: ButtonStyle.Primary, emoji: '➕', },
                { customId: 'pad2', style: ButtonStyle.Secondary, label: '\u200b', disabled: true, },
                { customId: Operations.confirm, style: ButtonStyle.Success, label: 'Confirm', emoji: '✅' }
            ]),
            new ButtonRow([
                { customId: Operations.switchL, style: ButtonStyle.Primary, emoji: '◀️' },
                { customId: 'pad3', style: ButtonStyle.Secondary, label: '\u200b', disabled: true },
                { customId: Operations.switchR, style: ButtonStyle.Primary, emoji: '▶️', }
            ]),
            new ButtonRow([
                { customId: 'pad4', style: ButtonStyle.Secondary, label: '\u200b', disabled: true },
                { customId: Operations.dec, style: ButtonStyle.Primary, emoji: '➖', },
                { customId: 'pad5', style: ButtonStyle.Secondary, label: '\u200b', disabled: true, }
            ])
        ];
    };

    private confirmed(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: `Result in your local time:\n${TimeStamp.gen(this._time.getTime())}`,
            footer: { text: 'dismiss this message to exit.' }
        };
    };

    private timedout(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: 'Timed out.',
            footer: { text: 'dismiss this message to exit.' }
        };
    };

    private static TimeFields: string[] = [
        'Year',
        'Month',
        'Date',
        'Hours',
        'Minutes'
    ];

    private static author = 'Time Selector alpha';
};
