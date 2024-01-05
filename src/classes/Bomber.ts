import { APIInteractionDataResolvedGuildMember, ButtonStyle, GuildMember, TextBasedChannel } from "discord.js";
import { doAfterSec } from "../functions/async/delay";
import { range } from "../functions/array/number";
import { byChance, randomInt, randomNumberRange } from "../functions/number/number";
import Button from "./ActionRow/Button";

class Bomber {
    channel: TextBasedChannel | null;
    target: GuildMember | APIInteractionDataResolvedGuildMember | null;
    frequency: number;
    period: number;

    bombing: boolean = true;

    constructor({ channel, target, frequency, period }:
        { channel: TextBasedChannel | null, target: GuildMember | APIInteractionDataResolvedGuildMember | null, frequency: number, period: number }) {
        this.channel = channel;
        this.target = target;
        this.frequency = frequency;
        this.period = period;
    }

    randomMessages = [
        '兄弟...',
        '兄弟，回覆，有急事',
        '兄弟，兄弟...',
        '兄弟，你是甲',
        '兄弟，你是偽娘',
        '兄弟，想草你',
        '兄弟，我的名字叫小八貓，我來自吉衣卡哇，我沒有兄弟的口頭禪，我也不是男同',
        '什麼情況兄弟',
        '兄弟，坐上來自己動',
        '兄弟，我們一起草你',
        '兄弟，快進來，外面冷',
        '兄弟，你有痔瘡，顆粒感好足',
        '兄弟，你好香',
        '兄弟，嘴一個',
        '你知道我要說什麼',
        '兄弟，伊呀哈',
        '兄弟，不可以',
        '兄弟，別草我',
        '兄弟，你好緊',
        '兄弟，到底?'
    ]

    trigger = () => {
        this.bombing = true;
    }

    stop = () => {
        this.bombing = false;
    }

    bomb = async (): Promise<void> => {
        if (!isNaN(this.frequency))
            range({ start: 1, end: this.frequency }).forEach(async x => {
                await doAfterSec(async () => {
                    if (this.bombing && this.target instanceof GuildMember)
                        await this.channel?.send(`<@${this.target?.id}> ${byChance(75) ? this.additionalMessage() : ''}`);
                }, x * this.period);
            })
    }

    imHere = (): Button => {
        return new Button({
            customId: '$stopbomb',
            label: 'OK~OK~Ok~ Just stop that shit!',
            style: ButtonStyle.Primary,
        })
    }

    additionalMessage = (): string => {
        const index = randomInt(0, this.randomMessages.length - 1);
        return this.randomMessages.splice(index, 1)[0];
    }
}
export = Bomber;