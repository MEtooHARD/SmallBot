import { ApplicationCommandType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/Command";
import { connectionStatus } from "../../../mongoose";
import { Referendum } from "../../../classes/Referendum";
import { ConnectionStates } from "mongoose";

export class referendum extends SlashCommand {
    override activated = true;

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
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

    executor = async (interaction: ChatInputCommandInteraction) => {
        if (connectionStatus.connectionState !== ConnectionStates.connected) {
            await interaction.reply('database not ready.');
            return;
        }

        interaction.showModal(Referendum.getCreationModal());
    }
}