import { Guild, Locale } from "discord.js";
import { tryCatch } from "../../../classes/Basic/GeneralTypes";
import { MessageCommand, Report } from "../../../classes/MessageFeature";

export const quit: MessageCommand = {
    name: 'quit',
    param: {
        required: false,
        pattern: ''
    },
    verify(message) {
        if (message.author.id !== '732128546407055452')
            return [null, 'You cannot use this command.'];
        if (message.guild === null)
            return [null, 'This command can only be used in a server.'];
        return [true, null];
    },
    exe: async (message, commandInfo): Promise<Report> => {
        const guild = message.guild as Guild;
        if (!message.channel.isDMBased()) {
            const local = guild.preferredLocale;
            tryCatch(message.channel.send(
                local === Locale.ChineseTW
                    ? '@SmallBot 離開了狗窩'
                    : local === Locale.ChineseCN
                        ? '@SmallBot 离开了狗窝'
                        : '@SmallBot has left the dog hole'
            ));
        }
        tryCatch(guild.leave());
        return { success: true };
    }
};