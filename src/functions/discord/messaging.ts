import { TextChannel } from "discord.js";
import { delaySec } from "../general/delay";

export const typing = async (channel: TextChannel, sec: number): Promise<void> => {
    await channel.sendTyping();
    await delaySec(sec);
}