import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { tryCatch } from "../../../classes/Basic/GeneralTypes";

export const fUCKoFF: MessageCommand = {
    name: 'fUCKoFF',
    param: {
        required: false,
        pattern: ''
    },
    verify(message) {
        return message.author.id === '732128546407055452' && message.channel instanceof DMChannel
            ? [true, null]
            : [null, 'You cannot use this command.'];
    },
    exe: async (message: Message<boolean>, commandInfo) => {
        await tryCatch(message.reply('fuck you'));
        await message.client.destroy();
        process.exit(1);
    }
}