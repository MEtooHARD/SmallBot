import create from "../../handleEvent/message/create";
import { on } from "../../app";
import { Events, Message } from "discord.js";

const messageCreate = () => {
    console.log('on ' + Events.MessageCreate);
    on(Events.MessageCreate, async (message: Message) => {
        await create(message);
    });
}


export = messageCreate;