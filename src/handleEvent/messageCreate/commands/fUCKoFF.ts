import { DMChannel, Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class fUCKoFF extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return message.author.id === '732128546407055452' && message.channel instanceof DMChannel;
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        await message.client.destroy();
        process.exit(1);
    };
};