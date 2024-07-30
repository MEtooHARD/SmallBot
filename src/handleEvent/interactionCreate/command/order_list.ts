import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../classes/OrderList';
import { Command } from '../../../classes/_Command';
import { SlashCommand } from '../../../classes/Command';

export = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .setDMPermission(false)
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.showModal(OrderList.creationModal());
    }
});