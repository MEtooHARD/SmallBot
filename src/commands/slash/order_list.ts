import { ApplicationCommandType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../classes/Command';
import OrderList from '../../classes/OrderList';

export class order_list extends SlashCommand {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .setContexts(InteractionContextType.Guild);

    executor = async (interaction: ChatInputCommandInteraction) => {
        interaction.showModal(OrderList.creationModal());
    }
}