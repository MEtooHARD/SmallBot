import { BaseChannel, Message, MessageReference, MessageReferenceType, PartialGroupDMChannel } from "discord.js";

export function Sendable(c: BaseChannel) {
    c.isTextBased() && !(c instanceof PartialGroupDMChannel);
}

export function isReply(
    message: Message
): message is Message & { reference: MessageReference } {
    return message.reference !== null &&
        message.channelId === message.reference.channelId &&
        message.reference.type === MessageReferenceType.Default;
}

export function isSelfMessage(message: Message): boolean {
    return message.author.id === message.client.user.id;
}
