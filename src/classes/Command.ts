import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface Command<T extends ChatInputCommandInteraction | CommandInteraction> {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: T) => Promise<void>;
    filter: (interaction: ChatInputCommandInteraction | CommandInteraction) => boolean;
}

export type CommandFilterOptionType = ChatInputCommandInteraction | CommandInteraction;