import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

abstract class Command {
    abstract execute(interaction: CommandInteraction): void;
    abstract data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;
    abstract filter(interaction: CommandInteraction): boolean;
}

export = Command;