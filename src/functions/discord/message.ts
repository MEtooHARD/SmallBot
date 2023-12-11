import { InteractionReplyOptions, InteractionResponse, Message } from "discord.js";

const deleteAfterSec = (message: Message | InteractionResponse, sec: number) => {
    setTimeout(() => {
        try {
            message.delete()
        } catch (e) { }
    }, 1000 * sec);
}

export { deleteAfterSec }