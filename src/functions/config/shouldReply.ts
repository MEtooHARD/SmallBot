import { Message } from "discord.js";
// import config from '../../config.json';

const shouldRpMsg = (message: Message) => {
    return /* (message.author.id !== config.bot.main.id) &&  */!message.author.bot;
}

export { shouldRpMsg };