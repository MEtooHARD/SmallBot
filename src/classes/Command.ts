import { CommandInteraction, SlashCommandBuilder } from "discord.js";

abstract class Command {
    abstract execute(interaction: CommandInteraction): void;
    abstract data: SlashCommandBuilder;
    abstract filter(interaction: CommandInteraction): boolean;
}

export = Command;