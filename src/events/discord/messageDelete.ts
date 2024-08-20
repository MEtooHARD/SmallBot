import del from "../../handleEvent/messageDelete";
import { on } from "../../app";
import { Events, Message } from "discord.js";

const messageDelete = () => {
    on(Events.MessageDelete, async (message: Message) => {
        await del(message);
    });
}


export = messageDelete;