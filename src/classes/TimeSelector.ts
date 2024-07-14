import { APIEmbed, ButtonInteraction, ButtonStyle, CacheType, ComponentType, InteractionCollector, InteractionReplyOptions, InteractionUpdateOptions, Message } from "discord.js";
import ButtonRow from "./ActionRow/ButtonRow"
import { timestamp } from "../functions/discord/mention";

enum Operations {
    inc = 'inc',
    dec = 'dec',
    switchR = 'switchR',
    switchL = 'switchL',
    confirm = 'confirm'
};

export class TimeSelector {
    time: Date;
    index: number = 0;
    description: string = '';
    idle: number = 60 * 1000;
    confirm: boolean = false;
    collector: InteractionCollector<ButtonInteraction<CacheType>> | null = null;

    constructor() {
        this.time = new Date()
        this.time.setMilliseconds(0);
        this.time.setSeconds(0);
    };

    stop(): void { if (this.collector) this.collector.stop(); };

    async select(message: Message, callback: (time: number) => void): Promise<void> {
        this.collector = message.createMessageComponentCollector<ComponentType.Button>({ idle: this.idle });

        this.collector.on('collect', async (interaction: ButtonInteraction) => {
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
                    callback(this.time.getTime());
                    this.confirm = true;
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

        this.collector.on('end', async (collected: ButtonInteraction<CacheType>) => {
            if (!this.confirm)
                try {
                    await message.edit({
                        embeds: [this.timedout()],
                        components: []
                    });
                } catch (e) { };
        });
    };

    adjustTimeBy(diff: number): void {
        switch (this.index) {
            case 0:
                this.time.setFullYear(this.time.getFullYear() + diff);
                break;
            case 1:
                this.time.setMonth(this.time.getMonth() + diff);
                break;
            case 2:
                this.time.setDate(this.time.getDate() + diff);
                break;
            case 3:
                this.time.setHours(this.time.getHours() + diff);
                break;
            case 4:
                this.time.setMinutes(this.time.getMinutes() + diff);
                break;
        }
    };

    inc(): void { this.adjustTimeBy(1); };

    dec(): void { this.adjustTimeBy(-1); };

    setIndex(diff: number): void { this.index = ((this.index + diff) % 5 + 5) % 5; };

    switchL(): void { this.setIndex(-1); };

    switchR(): void { this.setIndex(1); };

    selectorMsg(): InteractionReplyOptions {
        return {
            embeds: [this.embed()],
            components: TimeSelector.panel(),
            // ephemeral: true,
            fetchReply: true
        };
    };

    embed(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: this.description +
                `\nActive: ` +
                TimeSelector.TimeFields
                    .map((f, i) => i === this.index ? `*\`${f}\`*` : f).join(', '),
            fields: [{
                name: 'Local Time:',
                value: `<t:${this.time.getTime().toString().slice(0, -3)}>`
            }],
            footer: { text: 'idle: 1 min' }
        }
    };

    setDescription(desc: string): TimeSelector {
        this.description = desc;
        return this;
    };

    setIdle(duration: number): TimeSelector {
        this.idle = duration;
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

    confirmed(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: `Result in your local time:\n${timestamp(this.time.getTime())}`,
            footer: { text: 'dismiss this message to exit.' }
        };
    };

    timedout(): APIEmbed {
        return {
            author: { name: TimeSelector.author },
            description: 'Timed out.',
            footer: { text: 'dismiss this message to exit.' }
        };
    };

    static TimeFields: string[] = [
        'Year',
        'Month',
        'Date',
        'Hours',
        'Minutes'
    ];

    static author = 'Time Selector alpha';
};
