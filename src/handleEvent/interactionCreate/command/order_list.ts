import { ApplicationCommandType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../classes/OrderList';
import { Command } from '../../../classes/Command';

export = new Command<ApplicationCommandType.ChatInput>({
  data: new SlashCommandBuilder()
    .setName('order_list')
    .setDescription('Start an order list.')
    .setDMPermission(false)
  ,
  async executor(interaction: ChatInputCommandInteraction) {
    interaction.showModal(OrderList.creationModal());
  }
});