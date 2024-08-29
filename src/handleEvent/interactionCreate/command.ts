import { ChatInputCommandInteraction } from 'discord.js';
import { CM } from '../..';

export = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel || !interaction.guild?.members.me)
        return;
    /* get (slash) command */
    const command = CM.getCommand(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (interaction.channel.isDMBased()) {
        command.filter(interaction) && command.executor(interaction);
        return;
    }
    /* check permission */
    const permissions = interaction.channel
        .permissionsFor(interaction.guild.members.me);
    if (!permissions.has(command.botPermissions)) {
        if (interaction.channel.isThread()
            ? permissions.has("SendMessagesInThreads")
            : permissions.has("SendMessages"))
            interaction.reply({
                ephemeral: true,
                content: `missing following permissions: ${permissions.missing(command.botPermissions).join(', ')}`
            });
        return;
    }
    /* execute */
    if (command.filter(interaction))
        command.executor(interaction);
};