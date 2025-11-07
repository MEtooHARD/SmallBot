import { SendableChannels, Snowflake, TextBasedChannel, TextChannel } from "discord.js";
import { delaySec } from "../general/delay";

export async function typing(channel: SendableChannels, sec: number): Promise<void> {
    await channel.sendTyping();
    await delaySec(sec);
}

export function emojiUrl(id: Snowflake, animated: boolean = false): string {
    return `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;
}