import { CommandInteraction } from 'discord.js';
import { logCommand } from '../../../functions/general/log';
import Command from '../../../classes/Command';
import path from 'node:path';
import fs from 'node:fs';

const command = (interaction: CommandInteraction) => {

    fs.readdirSync(path.join(__dirname, 'command'))
        .filter(file => file.endsWith('.js')).forEach(name => {
            if (name === interaction.commandName.concat('.js')) {
                const command: Command = require('./command/' + name);
                if (command.filter(interaction)) {
                    logCommand(interaction);    //  log
                    command.execute(interaction);
                } else
                    interaction.reply({
                        ephemeral: true,
                        content: 'You are not allowed to use this command.'
                    });
                return;
            }
        })
}

export = command;