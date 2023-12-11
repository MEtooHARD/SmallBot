import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import chalk from 'chalk';

export = {
    data: new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
    ,
    async execute(interaction: CommandInteraction) {
        interaction.showModal(OrderList.creationModal());
        console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
            '\n\tused\n\t'
            + chalk.yellow(interaction.commandName));
    }
}