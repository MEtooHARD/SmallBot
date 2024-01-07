import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

abstract class Command {
    /* abstract info: {
        name: string,
        description: string
    } */
    abstract execute(interaction: CommandInteraction): void;
    // abstract data: SlashCommandBuilder;
    abstract data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder;
    abstract filter(interaction: CommandInteraction): boolean;
}

export = Command;