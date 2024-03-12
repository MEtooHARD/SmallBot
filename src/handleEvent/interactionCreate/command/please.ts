import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, User } from 'discord.js';
import OrderList from '../../../classes/OrderList';
import { Command } from '../../../classes/Command';
import { atUser } from '../../../functions/discord/mention';


export = new class order_list implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('please')
        .setDescription('Please a person.')
        .addUserOption(option => option
            .setName('target')
            .setDescription("The person you wonna please.")
            .setRequired(true))
        .setDMPermission(false)

    execute = async (interaction: ChatInputCommandInteraction) => {
        const target = (interaction.options.getUser('target') as User);
        interaction.reply(atUser(target) + "\n# 🟢 Accepted");
    }

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}