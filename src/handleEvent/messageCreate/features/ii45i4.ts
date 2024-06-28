import { Message } from "discord.js";
import { MessageFeature } from "../../../classes/MessageFeature";
import { byChance, randomInt } from "../../../functions/general/number";
import homo from "../../../functions/general/homo";

export = new class ii45i4 extends MessageFeature {
    filter(message: Message<boolean>, ...params: any): boolean {
        return /\d/.test(message.content) && byChance(5);
    };
    async exe(message: Message<boolean>, ...params: any): Promise<void> {
        const numbers = message.content.match(/\d+/gm) as RegExpMatchArray;
        const theOneChosenShit = numbers[randomInt(0, numbers.length - 1)];
        const result = homo(Number(theOneChosenShit));
        message.reply(`${theOneChosenShit} = \`${result}\``);
    };
};