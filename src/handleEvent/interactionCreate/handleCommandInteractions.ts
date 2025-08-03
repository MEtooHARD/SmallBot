import { ChatInputCommandInteraction, Colors, MessageContextMenuCommandInteraction, PermissionFlagsBits, UserContextMenuCommandInteraction } from "discord.js";
import { CommandInteractionIn } from "../../functions/discord/scope";
import { logSlashCommand } from "../../functions/general/log";
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from "../../utilities";

export const handleSlashCommand = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel || !interaction.guild?.members.me)
        return;
    /* get (slash) command */
    const command = SlashCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (interaction.channel.isDMBased()) {
        logSlashCommand(interaction);
        command.verify(interaction) && command.executor(interaction);
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

    const [success, reason] = command.verify(interaction);

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


export const handleUserContextMenuCommand = async (interaction: UserContextMenuCommandInteraction) => {
    /* get command */
    const command = UserMenuCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (CommandInteractionIn['BotDM'](interaction) || CommandInteractionIn['PrivateChannel'](interaction)) {
        const [success, reason] = command.verify(interaction);

        if (success) {
            command.executor(interaction);
        } else {
            interaction.reply({
                flags: 'Ephemeral',
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

        const [success, reason] = command.verify(interaction);

        if (success) {
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
};


export const handleMessageContextMenuCommand = async (interaction: MessageContextMenuCommandInteraction) => {
    /* get command */
    const command = MessageMenuCommands.get(interaction.commandName);
    if (!command) return;
    /* skip permission checking for DMChannel */
    if (CommandInteractionIn['BotDM'](interaction) || CommandInteractionIn['PrivateChannel'](interaction)) {
        const [success, reason] = command.verify(interaction);

        if (success) {
            command.executor(interaction);
        } else {
            interaction.reply({
                flags: 'Ephemeral',
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

        const [success, reason] = command.verify(interaction);

        if (success) {
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
};

