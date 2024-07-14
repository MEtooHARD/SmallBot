import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import { Referendum } from "../../../classes/Referendum";

export = new class referendum implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('referendum')
        .setDescription('Create a Referendum.')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        interaction.showModal(Referendum.creationModal);
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}