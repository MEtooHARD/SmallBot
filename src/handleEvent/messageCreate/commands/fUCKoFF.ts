import { Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class fUCKoFF extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => { return true; };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        await message.client.destroy();
        process.exit(1);
    };
};