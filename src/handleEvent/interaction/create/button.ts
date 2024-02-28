import { ButtonInteraction } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const button = (interaction: ButtonInteraction) => {
    fs.readdirSync(path.join(__dirname, 'button'))
        .filter(file => file.endsWith('.js'))
        .forEach(name => {
            if (name === interaction.customId.concat('.js'))
                require('./button/' + interaction.customId)(interaction);
        });
}

export = button;