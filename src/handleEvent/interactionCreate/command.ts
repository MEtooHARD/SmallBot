import { ChatInputCommandInteraction, Colors, PermissionFlagsBits } from 'discord.js';
import { SlashCommands } from '../../commands';

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
            ? permissions.has(PermissionFlagsBits.SendMessagesInThreads)
            : permissions.has(PermissionFlagsBits.SendMessages))
            interaction.reply({
                ephemeral: true,
                content: `I need permissions: ${permissions.missing(command.requiredPerms).join(', ')}`
            });
        return;
    }

    const [success, reason] = command.filter(interaction);

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