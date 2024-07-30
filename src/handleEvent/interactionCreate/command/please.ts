import { ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';
import { atUser } from '../../../functions/discord/mention';
import { SlashCommand } from '../../../classes/Command';


export = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('please')
        .setDescription('Please a person.')
        .addUserOption(option => option
            .setName('target')
            .setDescription("The person you wonna please.")
            .setRequired(true))
        .setDMPermission(false)
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        const target = (interaction.options.getUser('target') as User);
        interaction.reply(atUser(target) + "\n# 🟢 Accepted");
    }
});