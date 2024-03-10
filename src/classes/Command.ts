import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface Command<T extends ChatInputCommandInteraction | CommandInteraction> {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: T) => Promise<void>;
    filter: (interaction: T) => true | string;
}