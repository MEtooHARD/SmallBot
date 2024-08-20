import { ChatInputCommandInteraction } from 'discord.js';
import { CM } from '../../data';

export = async (interaction: ChatInputCommandInteraction) => {
    if (interaction.channel && interaction.guild?.members.me) {
        const command = CM.getCommand(interaction.commandName);
        if (command) {
            if (!(interaction.channel.isDMBased())) {
                const permissions = interaction.channel
                    .permissionsFor(interaction.guild.members.me);
                if (!permissions.has(command.permissions))
                    interaction.reply({
                        ephemeral: true,
                        content: `missing following permissions: ${permissions.missing(command.permissions).join(', ')}`
                    });
            }
            command.executor(interaction);
        } else {
            await interaction.reply({ ephemeral: true, content: 'command not found' });
        }
    }
};