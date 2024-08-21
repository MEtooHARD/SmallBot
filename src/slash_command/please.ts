import { ApplicationCommandType, ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';
import { Command } from '../classes/Command';
import { atUser } from '../functions/discord/mention';

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('please')
        .setDescription('Please a person.')
        .addUserOption(option => option
            .setName('target')
            .setDescription("The person you wonna please.")
            .setRequired(true))
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction) {
        const target = (interaction.options.getUser('target') as User);
        interaction.reply(atUser(target) + "\n# 🟢 Accepted");
    }
});