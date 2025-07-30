import { MessageCommand, Report } from "../../../classes/MessageFeature";
import { tryCatch } from "../../../classes/Basic/GeneralTypes";

export const seeguilds: MessageCommand = {
    name: 'seeguilds',
    param: {
        required: false,
        pattern: ''
    },
    exe: async (message, info): Promise<Report> => {
        const [msg, error] = await tryCatch(message.reply({
            content: message.client.guilds.cache
                .map(guild => `${guild.name}: ${guild.id}`).join('\n')
        }));
        return {
            success: error === null,
            error: error,
        }
    }
}
