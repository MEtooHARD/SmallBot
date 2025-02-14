import { ApplicationCommandType, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { Docor } from '../../classes/Docor';
import { HelpCenter } from '../..';

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
            components: doc ? [doc.SelectMenu()] : [],
            content: doc ? '' : 'something went wrong.'
        });

        const collector = rp.createMessageComponentCollector({
            idle: 5 * 60 * 1000,
            componentType: ComponentType.StringSelect,
            filter: i => i.message.id === rp.id
        });

        collector.on('collect', async i => {
            // HelpCenter.handleInteraction(i);
            const doc = HelpCenter.getDoc(i.values[0].split('>'));
            try {
                if (doc)
                    await i.update({
                        embeds: doc.getEmbeds(),
                        components: [doc.SelectMenu()]
                    });
                else
                    await i.update({
                        content: 'something went wrong. try use /help again.',
                        embeds: [],
                        components: []
                    })
            } catch (e) { }
        });
    }
});