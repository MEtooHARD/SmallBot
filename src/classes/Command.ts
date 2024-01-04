import { CacheType, CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

abstract class Command {
    abstract execute(interaction: CommandInteraction): void;
    // abstract data: SlashCommandBuilder;
    abstract data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;
    abstract filter(interaction: CommandInteraction): boolean;
}

export = Command;