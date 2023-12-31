import { APIInteractionDataResolvedGuildMember, ButtonStyle, GuildMember, TextBasedChannel } from "discord.js";
import { doAfterSec } from "../functions/async/delay";
import { range } from "../functions/array/number";
import { Button } from "./ActionRaw";


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
                        await this.channel?.send(`<@${this.target?.id}>`)
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
}
export = Bomber;