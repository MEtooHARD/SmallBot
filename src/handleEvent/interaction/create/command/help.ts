import { BaseInteraction, CacheType, CommandInteraction, SlashCommandBuilder, StringSelectMenuInteraction } from 'discord.js';
import { HelpCenter } from '../../../../classes/HelpCenter';
import Command from '../../../../classes/Command';


export = new class help extends Command {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')

    execute = async (interaction: CommandInteraction) => {
        const helpCenter = new HelpCenter();
        const replyMessage = await interaction.reply(helpCenter.home());
        const collector = replyMessage.createMessageComponentCollector({ idle: 5 * 60 * 1000 });

        collector.on('collect', async (interaction: BaseInteraction) => {
            if (interaction instanceof StringSelectMenuInteraction) {
                // await interaction.deferUpdate();
                const update = helpCenter.docMsg(interaction.values[0].split('/'));
                interaction.update({
                    embeds: update.embeds,
                    components: update.components
                });
            }
        });

        collector.on('end', () => {
            try {
                replyMessage.edit({
                    content: 'Session ended. Use </help:1184688927475503145> to activate helpcenter again.',
                    components: []
                });
            } catch (e) { }
        });
    }

    filter = (interaction: CommandInteraction) => {
        return true;
    }
}