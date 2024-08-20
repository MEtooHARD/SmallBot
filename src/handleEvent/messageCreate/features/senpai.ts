import { AttachmentBuilder, Message } from "discord.js";
import { MessageFeature } from "../../../classes/MessageFeature";
import fs from "node:fs";
import path from "node:path";
import rootPath from "get-root-path";
import { byChance } from "../../../functions/general/number";

export = new class senpai extends MessageFeature {
  filter(message: Message<boolean>, ...params: any): boolean {
    return message.content.includes('114514') && byChance(1);
  };

  async exe(message: Message<boolean>, ...params: any): Promise<void> {
    message.channel.send({
      files: [new AttachmentBuilder(fs.readFileSync(path.join(rootPath, 'media', 'pic', '114514.webp')))]
    });
  }
}; 