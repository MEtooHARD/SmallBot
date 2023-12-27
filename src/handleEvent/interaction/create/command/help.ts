import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import chalk from 'chalk';
import {HelpCenter} from '../../../../classes/HelpCenter';


export = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')
    ,
    async execute(interaction: CommandInteraction) {
        

        // console.log(HelpCenter.docDirs([HelpCenter.docRoot, 'HelpCenter']));
        // console.log(HelpCenter.homeDoc());
        interaction.reply(HelpCenter.homeDoc());
    }
}