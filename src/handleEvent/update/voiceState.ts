import { VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, generateDependencyReport, joinVoiceChannel } from '@discordjs/voice';
import { VoiceState } from 'discord.js';
import path from 'node:path';

const update = async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    /* if (!newState.member?.user.equals(newState.client.user) && newState.channel && newState.guild) {
        const connection = joinVoiceChannel({
            channelId: newState.channel.id,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator
        });

        const resource = createAudioResource(path.resolve(__dirname, '..', '..', 'media', 'Whistle.mp3'), { inlineVolume: true });
        resource.volume?.setVolume(0.5);

        const player = createAudioPlayer({});

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5 * 1000);
        } catch (e) {
            console.log(e)
        }

        connection.subscribe(player);

        player.play(resource);

        // console.log(generateDependencyReport());

        player.on('error', error => {
            console.log(error);
        })
    } */
}

export = update;