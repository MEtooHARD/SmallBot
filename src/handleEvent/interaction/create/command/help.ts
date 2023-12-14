import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import OrderList from '../../../../classes/OrderList';
import chalk from 'chalk';
import HelpCenter from '../../../../classes/HelpCenter';

export = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')
    ,
    async execute(interaction: CommandInteraction) {
        console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) + ' at ' + chalk.blue(`[${interaction.guild?.name}:${interaction.guild?.id}]`) +
            '\n\tused\n\t'
            + chalk.yellow(interaction.commandName));

        console.log(HelpCenter.docDirs([HelpCenter.docRoot, 'HelpCenter']));
    }
}