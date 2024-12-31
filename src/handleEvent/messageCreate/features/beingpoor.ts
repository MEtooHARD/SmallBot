import { Message } from "discord.js";
import { MessageFeature } from "../../../classes/MessageFeature";
import { byChance } from "../../../functions/general/number";
import { earn500 } from "../../../functions/discord/cmps";

export = new class beingpoor extends MessageFeature {
    filter(message: Message<boolean>, ...params: any): boolean {
        return byChance(0.25) && !message.channel.isDMBased();
    };

    async exe(message: Message<boolean>, ...params: any): Promise<void> {
        if (!message.channel.isDMBased())
            await message.channel.send({
                content: 'Being poor?',
                components: earn500(false)
            });
    };
};