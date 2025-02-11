import { Colors, MessageContextMenuCommandInteraction, PermissionFlagsBits } from "discord.js";
import { MessageMenuCommands } from "../../commands";
import { CommandInteractionIn } from "../../functions/discord/scope";

export const handleMessageContextMenu = async (interaction: MessageContextMenuCommandInteraction) => {
    /* get command */
    const command = MessageMenuCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (CommandInteractionIn['BotDM'](interaction) || CommandInteractionIn['PrivateChannel'](interaction)) {
        const [success, reason] = command.validator(interaction);

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
        return;
    }

    if (CommandInteractionIn['Guild'](interaction)) {
        /* check permission */
        const permissions = interaction.appPermissions;
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

        const [success, reason] = command.validator(interaction);

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
};