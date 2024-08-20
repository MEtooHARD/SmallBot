import { Message } from "discord.js";
import { MessageFeature } from "../../../classes/MessageFeature";
import { byChance } from "../../../functions/general/number";

export = new class stinky extends MessageFeature {
  filter(message: Message<boolean>, ...params: any): boolean {
    return message.content.includes('臭') && byChance(5);
  };

  async exe(message: Message<boolean>, ...params: any): Promise<void> {
    message.reply('好臭');
  };
};