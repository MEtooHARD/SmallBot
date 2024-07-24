import { ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import { Referendum } from "../../../classes/Referendum";
import { connectionStatus } from "../../../mongoose";
import { ConnectionStates } from "mongoose";

export = new class referendum implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('referendum')
        .setDescription('Create a Referendum.')
        .addStringOption(option => option
            .setName('action')
            .setDescription('Select an action')
            .setRequired(true)
            .setChoices({
                name: 'Create',
                value: 'create'
            }))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (connectionStatus.connectionState !== ConnectionStates.connected) {
            await interaction.reply('database not ready.');
            return;
        }

        interaction.showModal(Referendum.getCreationModal());
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}