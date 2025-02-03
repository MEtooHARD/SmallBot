import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { SlashCommands } from '../..';

export = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel || !interaction.guild?.members.me)
        return;
    /* get (slash) command */
    const command = SlashCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (interaction.channel.isDMBased()) {
        command.filter(interaction) && command.executor(interaction);
        return;
    }
    /* check permission */
    const permissions = interaction.channel
        .permissionsFor(interaction.guild.members.me);
    if (!permissions.has(command.requiredPerms)) {
        if (interaction.channel.isThread()
            ? permissions.has("SendMessagesInThreads")
            : permissions.has("SendMessages"))
            interaction.reply({
                ephemeral: true,
                content: `You\'re missing the following permissions: ${permissions.missing(command.requiredPerms).join(', ')}`
            });
        return;
    }
    /* filter */
    const [success, reason] = command.filter(interaction);
    /* execute */
    if (success) {
        command.executor(interaction);
    } else {
        interaction.reply({
            ephemeral: true,
            embeds: [{
                color: Colors.Yellow,
                description: `Access denied: ${reason}`
            }]
        });
    }
};