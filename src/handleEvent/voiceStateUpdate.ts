import { Colors, PermissionFlagsBits, PermissionsBitField, StageChannel, VoiceChannel, VoiceState } from 'discord.js';
import { botConfig } from '../app';

const update = async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    const newChPermissions = newState.channel?.permissionsFor(botConfig.id);
    const oldChPermissions = oldState.channel?.permissionsFor(botConfig.id);

    /* join */
    if (oldState.channel === null
        && newState.channel
        && newState.channel.members.size > 1
        && newChPermissions?.has(PermissionFlagsBits.SendMessages))
        newState.channel.send({
            embeds: [{
                color: Colors.Green,
                description: `${newState.member?.displayName} joined the voice.`
            }]
        });

    /* left */
    if (newState.channel === null
        && oldState.channel
        && oldState.channel.members.size > 1
        && oldChPermissions?.has(PermissionFlagsBits.SendMessages))
        oldState.channel.send({
            embeds: [{
                color: Colors.Red,
                description: `${newState.member?.displayName} left the voice.`
            }]
        });
}

export = update;