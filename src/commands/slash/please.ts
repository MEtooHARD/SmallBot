import { ApplicationCommandType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder, User } from 'discord.js';
import { Command } from '../../classes/Command';
import { atUser } from '../../functions/discord/mention';

export class please extends Command<ApplicationCommandType.ChatInput> {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('please')
        .setDescription('Please a person.')
        .addUserOption(option => option
            .setName('target')
            .setDescription("The person you wonna please.")
            .setRequired(true))
        .setContexts(InteractionContextType.Guild);

    executor = async (interaction: ChatInputCommandInteraction) => {
        const target = (interaction.options.getUser('target') as User);
        interaction.reply(atUser(target) + "\n# 🟢 Accepted");
    }
};
