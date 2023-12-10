import { CommandInteraction } from 'discord.js';
import Log from '../../../classes/Log';
import path from 'node:path';
import fs from 'node:fs';

const command = (interaction: CommandInteraction) => {
    console.log('command');
    const log = new Log({ event: 'command', user: interaction.user });

    fs.readdirSync(path.join(__dirname, 'command'))
        .filter(file => file.endsWith('.js')).forEach(name => {
            let command = interaction.commandName
            if (name === command + '.js') {
                require('./command/' + name).execute(interaction)
                return;
            }
        })
}

export = command;