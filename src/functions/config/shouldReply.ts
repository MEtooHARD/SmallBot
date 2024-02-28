import { Message } from "discord.js";

const shouldRpMsg = (message: Message) => {
    return !message.author.bot;
}

export { shouldRpMsg };