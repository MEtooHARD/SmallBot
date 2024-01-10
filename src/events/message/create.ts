import create from "../../handleEvent/message/create";
import { on } from "../../app";
import { Events, Message } from "discord.js";

const messageCreate = () => {
    on(Events.MessageCreate, async (message: Message) => {
        await create(message);
    });
}


export = messageCreate;