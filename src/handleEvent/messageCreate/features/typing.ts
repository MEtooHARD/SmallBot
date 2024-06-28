import { Message } from "discord.js";
import { MessageFeature } from "../../../classes/MessageFeature";
import { byChance, randomInt } from "../../../functions/general/number";
import { delaySec } from "../../../functions/general/delay";

export = new class typing extends MessageFeature {
    filter(message: Message<boolean>, ...params: any): boolean {
        return byChance(1);
    };

    async exe(message: Message<boolean>, ...params: any): Promise<void> {
        do {
            try { message.channel.sendTyping(); } catch (e) { }
            delaySec(randomInt(8, 15));
        } while (byChance(10))
    };
};