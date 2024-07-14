import { BaseGuildTextChannel, Message, TextChannel } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class t extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return true;
    };

    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        message.channel.send(
            'mentioned' +
            '\nmembers: ' + message.mentions.members?.map(member => member.displayName)
            // '\nchannels: ' + message.mentions.channels.filter(ch => ch instanceof TextChannel).map(ch => ch.)
        );
        // const emojiRegex = /\b\w+\:\d{19}\b/g;
        // // console.log(param)
        // message.delete();
        // await message.channel.sendTyping();
        // // await delaySec(randomInt(5, 10));
        // if (param.length) message.channel.send(param.map(text => emojiRegex.test(text) ? `<:${text}>` : text).join(' '));
    };
};

