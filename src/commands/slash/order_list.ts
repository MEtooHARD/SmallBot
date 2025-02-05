import { ApplicationCommandType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { AppCommand } from '../../classes/Command';
import OrderList from '../../classes/OrderList';

export class order_list extends AppCommand<ApplicationCommandType.ChatInput> {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .setContexts(InteractionContextType.Guild);

    executor = async (interaction: ChatInputCommandInteraction) => {
        interaction.showModal(OrderList.creationModal());
    }
}