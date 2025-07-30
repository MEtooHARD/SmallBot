import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from "../../../utilities";
import { CommandManager } from "../../../classes/Command";
import { tryCatch } from "../../../classes/Basic/GeneralTypes";

export const reloadSC: MessageCommand = {
    name: 'reloadSC',
    param: {
        required: false,
        pattern: ''
    },
    verify(message) {
        return message.channel instanceof DMChannel && message.author.id === '732128546407055452'
            ? [true, null]
            : [null, 'This command is not available here.'];
    },
    async exe(message, command) {
        const [success, error] =
            await CommandManager.registerCommands([
                ...SlashCommands.vals(),
                ...MessageMenuCommands.vals(),
                ...UserMenuCommands.vals()
            ]);

        if (success) tryCatch(message.reply(
            `Slash:
${[...SlashCommands.keys()].join('\n')}

Message Menu:
${[...MessageMenuCommands.keys()].join('\n')}

User Menu:
${[...UserMenuCommands.keys()].join('\n')}`));

        if (error) tryCatch(message.reply('failed'));

        return { success: true };
    }
};
