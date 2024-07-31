import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { SCM, loadSlashCommand } from "../../../data";

export = new class reloadSC extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        // loadSlashCommand(true);
        try {
            await SCM.registerAllCommands();
            await message.reply(SCM.getCommandNames().join('\n'));
        } catch (e) {
            await message.reply('failed');
        }
    };
};