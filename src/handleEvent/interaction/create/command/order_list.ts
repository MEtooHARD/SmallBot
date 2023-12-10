// import path from 'node:path';
// import fs from 'node:fs';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';

export = {
    data: new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
    ,
    async execute(interaction: CommandInteraction) {
        interaction.showModal(OrderList.creationModal());
    }
}