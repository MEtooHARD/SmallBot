import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { SlashCommands } from "../../..";

export = new class reloadSC extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        const [success, error] = await SlashCommands.registerCommands();

        if (success)
            message.reply([...SlashCommands.keys()].join('\n'));
        if (error)
            message.reply('failed');
    };
};