import del from "../../handleEvent/message/delete";
import { on } from "../../app";
import { Events, Message } from "discord.js";

const messageDelete = () => {
    on(Events.MessageDelete, async (message: Message) => {
        await del(message);
    });
}


export = messageDelete;