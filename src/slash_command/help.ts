import { ApplicationCommandType, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import { Command } from '../classes/Command';
import { Docor } from '../classes/Docor';
import { HelpCenter } from '../app';

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')
    ,
    async executor(interaction: ChatInputCommandInteraction) {
        const doc = HelpCenter.getDoc(['Help Center']);
        const rp = await interaction.reply({
            fetchReply: true,
            ephemeral: true,
            embeds: doc ? doc.getEmbeds() : [],
            components: doc ? [Docor.resolveToSelectMenu(doc)] : [],
            content: doc ? '' : 'something went wrong.'
        });

        const collector = rp.createMessageComponentCollector({
            idle: 5 * 60 * 1000,
            componentType: ComponentType.StringSelect,
            filter: i => i.message.id === rp.id
        });

        collector.on('collect', async i => {
            await HelpCenter.handleInteraction(i);
        });
    }
});