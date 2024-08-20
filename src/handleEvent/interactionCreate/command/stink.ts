import { ApplicationCommandType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import { picPath } from '../../../functions/general/path';
import { Command } from '../../../classes/Command';

const items: string[] = [
  'God\'s Hands'
];

export = new Command<ApplicationCommandType.ChatInput>({
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
  async executor(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      files: [
        {
          attachment: fs.readFileSync(picPath('114514.webp'))
        }
      ]
    });
  }
});