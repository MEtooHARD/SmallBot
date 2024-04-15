import { VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, generateDependencyReport, joinVoiceChannel } from '@discordjs/voice';
import { VoiceState } from 'discord.js';
import path from 'node:path';
import { byChance, randomInt } from '../functions/general/number';
import { delaySec, doAfterSec } from '../functions/general/delay';

const update = async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    /* if (!newState.member?.user.equals(newState.client.user) && newState.channel && newState.guild) {
        if (byChance(15)) {
            await delaySec(randomInt(10, 20));

            const connection = joinVoiceChannel({
                channelId: newState.channel.id,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator
            });

            await delaySec(3);

            newState.channel.send('hello mother fucker');

            doAfterSec(() => {
                connection.destroy();
            }, randomInt(10, 20));
        }
    } */
}

export = update;