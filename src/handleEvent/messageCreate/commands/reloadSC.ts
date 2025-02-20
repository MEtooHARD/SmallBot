import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from "../../../utilities";
import { CommandManager } from "../../../classes/Command";

export = new class reloadSC extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452';
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        const [success, error] =
            await CommandManager.registerCommands([
                ...SlashCommands.vals(),
                ...MessageMenuCommands.vals(),
                ...UserMenuCommands.vals()
            ]);

        if (success) message.reply(
            `Slash:
${[...SlashCommands.keys()].join('\n')}

Message Menu:
${[...MessageMenuCommands.keys()].join('\n')}

User Menu:
${[...UserMenuCommands.keys()].join('\n')}`);

        if (error) message.reply('failed');
    };
};