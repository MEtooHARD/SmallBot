import { ButtonInteraction } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const button = async (interaction: ButtonInteraction) => {
  for (const name of fs.readdirSync(path.join(__dirname, 'button'))
    .filter(file => file.endsWith('.js')))
    if (name === interaction.customId.concat('.js'))
      await require('./button/' + interaction.customId)(interaction);

}

export = button;