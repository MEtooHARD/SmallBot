import { Colors, GuildMember, PermissionFlagsBits, PermissionsBitField, StageChannel, VoiceChannel, VoiceState } from 'discord.js';
import { atUser } from '../functions/discord/mention';

const update = async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    if ((await newState.guild.members.fetch(newState.client)).permissions.has(PermissionsBitField.Flags.Administrator))
        if (newState.channel instanceof VoiceChannel && oldState.channel?.id !== newState.channel.id) {
            newState.channel.send({
                embeds: [
                    {
                        color: Colors.Green,
                        description: `${newState.member?.displayName} joined the voice.`
                    }
                ]
            });
        } else if (!(newState.channel instanceof StageChannel) && oldState.channel) {
            oldState.channel.send({
                embeds: [
                    {
                        color: Colors.Red,
                        description: `${newState.member?.displayName} left the voice.`
                    }
                ]
            });
        }

}

export = update;