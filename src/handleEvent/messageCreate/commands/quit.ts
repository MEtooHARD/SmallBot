import { Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class fUCKoFF extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        if (!message.channel.isDMBased())
            try {
                await message.channel.send('@SmallBot 離開了 狗窩');
            } catch (e) { };
        message.guild?.leave();
    };
};