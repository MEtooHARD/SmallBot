import { BaseChannel, Message, MessageActivityType, MessageReferenceType, PartialGroupDMChannel } from "discord.js";

export function Sendable(c: BaseChannel) {
    c.isTextBased() && !(c instanceof PartialGroupDMChannel);
}

export function isReply(message: Message): boolean {
    const ref = message.reference;
    if (ref === null) return false;
    if (message.channelId !== ref.channelId) return false;
    if (ref.type !== MessageReferenceType.Default) return false;
    return true;
}