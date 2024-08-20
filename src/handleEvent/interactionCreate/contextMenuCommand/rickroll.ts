import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

export const data = new ContextMenuCommandBuilder()
  .setName('Rick Roll')
  .setDMPermission(false)
  .setType(ApplicationCommandType.User);