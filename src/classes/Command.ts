import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface Command<T extends ChatInputCommandInteraction | CommandInteraction> {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: T) => Promise<void>;
    filter: (interaction: T) => true | string;
}