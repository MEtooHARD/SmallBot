import { client } from "../../app"
import { atUser } from "../../functions/discord/mention"
import { sections } from "../../functions/general/string"

export const unknownError = () => {
    process.on('uncaughtException', (err, origin) => sendDebugMessage(err, origin))
    process.on('unhandledRejection', (err, origin) => sendDebugMessage(err, origin))
}

export const sendDebugMessage = async (err: Error | unknown, origin: NodeJS.UncaughtExceptionOrigin | Promise<unknown>) => {
    console.error(err);
    try {
        const reportChannel = client.guilds.cache.get('1213341621542719548')?.channels.cache.get('1267489062135009290');
        if (reportChannel && reportChannel.isTextBased()) {
            const msg = atUser('732128546407055452') + ' please debug:\n'
                + `Caught exception: ${err}\n`
                + `Exception origin: ${origin}`;
            for (const section of sections(6000, msg))
                await reportChannel.send(section);
        }
    } catch (error) { console.error(err); };
};
