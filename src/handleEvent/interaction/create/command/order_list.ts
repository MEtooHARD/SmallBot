import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import { Command, CommandFilterOptionType } from '../../../../classes/Command';


export = new class order_list implements Command<CommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .setDMPermission(false)

    execute = async (interaction: CommandInteraction) => {
        interaction.showModal(OrderList.creationModal());
    }

    filter = (interaction: CommandFilterOptionType) => {
        return true;
    }
}