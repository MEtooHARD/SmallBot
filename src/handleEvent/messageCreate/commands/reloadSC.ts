import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { CM } from "../../../app";

export = new class reloadSC extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        // loadSlashCommand(true);
        try {
            await CM.registerAllCommands();
            await message.reply(CM.getCommandNames().join('\n'));
        } catch (e) {
            await message.reply('failed');
        }
    };
};