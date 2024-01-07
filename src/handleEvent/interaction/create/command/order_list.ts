import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import Command from '../../../../classes/Command';


export = new class order_list extends Command {
    data = new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .setDMPermission(false)

    execute = async (interaction: CommandInteraction) => {
        interaction.showModal(OrderList.creationModal());
    }

    filter = (interaction: CommandInteraction) => {
        return true;
    }
}