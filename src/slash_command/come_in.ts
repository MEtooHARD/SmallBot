import { ApplicationCommandType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { Command } from "../classes/Command";
import { atVoiceChannel } from "../functions/discord/mention";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('come_in')
        .setDescription('Invite me to join a voice channel')
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.member instanceof GuildMember)
            if (interaction.member.voice.channel && interaction.guild) {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });

                // const resource = createAudioResource()

                // const player = createAudioPlayer({

                // })

                interaction.reply({
                    ephemeral: true,
                    content: `Joint ${atVoiceChannel(interaction.member.voice.channel)}.`
                });
            } else {
                interaction.reply({
                    ephemeral: true,
                    content: 'You must be in a voice channel.'
                });
            }
    }
});