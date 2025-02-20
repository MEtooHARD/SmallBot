import { ChatInputCommandInteraction, Colors, PermissionFlagsBits } from 'discord.js';
import { SlashCommands } from '../../utilities';
import { logSlashCommand } from '../../functions/general/log';

export const handleSlashCommand = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel || !interaction.guild?.members.me)
        return;
    /* get (slash) command */
    const command = SlashCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (interaction.channel.isDMBased()) {
        logSlashCommand(interaction);
        command.validator(interaction) && command.executor(interaction);
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
                flags: 'Ephemeral',
                content: `I need permissions: ${permissions.missing(command.requiredPerms).join(', ')}`
            });
        return;
    }

    const [success, reason] = command.validator(interaction);

    if (success) {
        logSlashCommand(interaction);
        command.executor(interaction);
    } else {
        interaction.reply({
            flags: 'Ephemeral',
            embeds: [{
                color: Colors.Yellow,
                description: `Access denied: ${reason}`
            }]
        });
    }
};