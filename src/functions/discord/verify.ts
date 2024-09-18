import { BaseChannel, PartialGroupDMChannel } from "discord.js";

export const Sendable = (c: BaseChannel) =>
    c.isTextBased() && !(c instanceof PartialGroupDMChannel);

