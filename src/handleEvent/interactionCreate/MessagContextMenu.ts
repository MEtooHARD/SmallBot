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
                    description: `Access denied: ${reason}`,
                }]
            });
        }
        return;
    }

    if (CommandInteractionIn['Guild'](interaction)) {
        /* check permission */
        if (interaction.guild && !interaction.appPermissions.has(command.requiredPerms)) {
            interaction.reply({
                flags: 'Ephemeral',
                embeds: [{
                    color: Colors.Yellow,
                    description: `I lack the permissions: ${interaction.appPermissions.missing(command.requiredPerms).join(', ')}`
                }]
            });
            return;
        }
        // else if (!interaction.guild && !interaction.memberPermissions?.has(PermissionFlagsBits.SendMessages)) {
        //     interaction.reply({
        //         flags: 'Ephemeral',
        //         embeds: [{
        //             color: Colors.Yellow,
        //             description: `You lack the permissions: ${interaction.appPermissions.missing(command.requiredPerms).join(', ')}`
        //         }]
        //     });
        //     return;
        // }

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