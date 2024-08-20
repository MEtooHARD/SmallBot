import create from "../../handleEvent/messageCreate";
import { on } from "../../app";
import { Events, Message } from "discord.js";

const messageCreate = () => {
  on(Events.MessageCreate, async (message: Message) => {
    await create(message);
  });
}


export = messageCreate;