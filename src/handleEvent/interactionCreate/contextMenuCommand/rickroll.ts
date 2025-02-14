import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType } from "discord.js";

export const data = new ContextMenuCommandBuilder()
    .setName('Rick Roll')
    .setContexts([InteractionContextType.Guild])
    .setType(ApplicationCommandType.User);