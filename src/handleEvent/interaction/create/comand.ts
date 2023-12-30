import { CommandInteraction } from 'discord.js';
import Log from '../../../classes/Log';
import path from 'node:path';
import fs from 'node:fs';
import { logCommand } from '../../../functions/log/log';
import Command from '../../../classes/Command';

const command = (interaction: CommandInteraction) => {
    // const log = new Log({ event: 'command', user: interaction.user });

    fs.readdirSync(path.join(__dirname, 'command'))
        .filter(file => file.endsWith('.js')).forEach(name => {
            let commandName = interaction.commandName
            if (name === commandName + '.js') {
                const command = require('./command/' + name);
                if (command.filter(interaction)) {
                    logCommand(interaction);
                    require('./command/' + name).execute(interaction)
                } else {
                    interaction.reply({
                        ephemeral: true,
                        content: 'You are not allowed to use this command.'
                    })
                }
                return;
            }
        })
}

export = command;