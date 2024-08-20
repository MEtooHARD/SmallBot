import { Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";

export = new class seeguilds extends MessageCommand {
  filter = (message: Message<boolean>, param: string[]): boolean => {
    return message.author.id === '732128546407055452';
  };

  exe = async (message: Message, param: string[]): Promise<void> => {
    message.reply({
      content: message.client.guilds.cache
        .map(guild => `${guild.name}: ${guild.id}`).join('\n')
    })
  };
};