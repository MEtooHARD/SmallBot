import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import chalk from 'chalk';
import Command from '../../../../classes/Command';


export = new class order_list extends Command {
    data = new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')

    execute = async (interaction: CommandInteraction) => {
        interaction.showModal(OrderList.creationModal());
    }

    filter = (interaction: CommandInteraction) => {
        return true;
    }
}

/* export = {
    data: new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
    ,
    async execute(interaction: CommandInteraction) {
        interaction.showModal(OrderList.creationModal());
        
    }
} */