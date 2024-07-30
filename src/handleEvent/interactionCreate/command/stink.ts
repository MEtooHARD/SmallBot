import { Command } from '../../../classes/_Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import { picPath } from '../../../functions/general/path';
import { SlashCommand } from '../../../classes/Command';

const items: string[] = [
    'God\'s Hands'
];

export = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('stink')
        .setDescription('1145141919810')
        .addStringOption(option => option
            .setName('item')
            .setDescription('Stinky Thingy')
            .setChoices(...items.map(x => { return { name: x, value: x, } }))
            .setRequired(true))
        .setDMPermission(false)
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            files: [
                {
                    attachment: fs.readFileSync(picPath('114514.webp'))
                }
            ]
        });
    }
});