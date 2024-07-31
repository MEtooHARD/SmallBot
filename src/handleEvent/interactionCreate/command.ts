import { ChatInputCommandInteraction } from 'discord.js';
import { SCM } from '../../data';

export = async (interaction: ChatInputCommandInteraction) => {
    const exe = SCM.getCommand(interaction.commandName)?.executor;
    if (exe) {
        exe(interaction);
    } else {
        await interaction.reply({ ephemeral: true, content: 'service not found' });
    }
};