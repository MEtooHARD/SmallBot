import { Command, CommandFilterOptionType } from '../../../../classes/Command';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { picPath } from '../../../../functions/general/path';

const items: string[] = [
    'God\'s Hands'
];

export = new class stink implements Command<CommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('stink')
        .setDescription('1145141919810')
        .addStringOption(option => option
            .setName('item')
            .setDescription('Stinky Thingy')
            .setChoices(...items.map(x => { return { name: x, value: x, } }))
            .setRequired(true))
        .setDMPermission(false)

    execute = async (interaction: CommandInteraction) => {
        interaction.reply({
            files: [
                {
                    attachment: fs.readFileSync(picPath('114514.webp'))
                }
            ]
        });
    }

    filter = (interaction: CommandFilterOptionType) => {
        return true;
    }
}