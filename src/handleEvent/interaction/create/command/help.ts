import { BaseInteraction, CacheType, CommandInteraction, SlashCommandBuilder, StringSelectMenuInteraction } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import chalk from 'chalk';
import { HelpCenter } from '../../../../classes/HelpCenter';
import Command from '../../../../classes/Command';


export = new class help extends Command {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')

    execute = async (interaction: CommandInteraction) => {
        // console.log(HelpCenter.docDirs([HelpCenter.docRoot, 'HelpCenter']));
        // console.log(HelpCenter.homeDoc());
        // interaction.reply(HelpCenter.homeDoc());
        /* interaction.reply({
            ephemeral: true,
            content: 'lmao',

        }) */
        const helpCenter = new HelpCenter();
        // console.log(helpCenter.docMsg(['..', 'docs', 'HelpCenter']));
        const replyMessage = await interaction.reply(helpCenter.docMsg(['..', 'docs', 'HelpCenter']));
        const collector = replyMessage.createMessageComponentCollector({ idle: 10 * 1000 });

        collector.on('collect', async (interaction: BaseInteraction) => {
            if (interaction instanceof StringSelectMenuInteraction) {
                await interaction.deferUpdate();
                interaction.editReply(helpCenter.docMsg(interaction.values[0].split('/')));
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