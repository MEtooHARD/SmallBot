import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { MessageMenuCommands, SlashCommands } from "../../../commands";
import { CommandManager } from "../../../classes/Command";

export = new class reloadSC extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        const [success, error] =
            await CommandManager.registerCommands([
                ...SlashCommands.vals(),
                ...MessageMenuCommands.vals()
            ]);

        if (success)
            message.reply(
                `Slashes:
${[...SlashCommands.keys()].join('\n')}

Menus:
${[...MessageMenuCommands.keys()].join('\n')}`);
        if (error)
            message.reply('failed');
    };
};