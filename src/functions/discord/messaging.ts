import { TextChannel } from "discord.js";
import { delaySec } from "../general/delay";

export async function typing(channel: TextChannel, sec: number): Promise<void> {
    await channel.sendTyping();
    await delaySec(sec);
}