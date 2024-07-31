import { Message } from "discord.js";
import { Session, session } from "../../app";

const shouldRpMsg = (message: Message) => {
    return !message.author.bot /* && session === Session.main ? message.channel.id !== '1151741686389690428'  : true;*/
}

export { shouldRpMsg };