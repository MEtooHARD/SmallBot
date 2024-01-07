import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
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
        interaction.reply({
            ephemeral: true,
            content: 'lmao'
        })
    }

    filter = (interaction: CommandInteraction) => {
        return true;
    }
}