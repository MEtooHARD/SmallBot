import { BaseGuildTextChannel, Message, TextChannel } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class t extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return true;
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        message.channel.send(message.content);
    };
};

