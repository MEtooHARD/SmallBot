import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";

abstract class Command {
    abstract execute(interaction: CommandInteraction): void;
    // abstract data: SlashCommandBuilder;
    abstract data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    abstract filter(interaction: CommandInteraction): boolean;
}

export = Command;