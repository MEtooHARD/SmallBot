import { Interaction } from 'discord.js';
import menu from './interactionCreate/menu';
import modal from './interactionCreate/modal';
import button from './interactionCreate/button';
import command from './interactionCreate/command';
import autocomplete from './interactionCreate/autocomplete';
import { getSvcInfo } from '../functions/discord/service';
import rootPath from 'get-root-path';
import path from 'node:path';
import fs from 'node:fs';
import { shouldLogIgnoredCustomID } from '../app';

const create = async (interaction: Interaction): Promise<void> => {
    if (interaction.isCommand())
        command(interaction);
    else if (interaction.isAutocomplete())
        autocomplete(interaction);
    else {
        if (!interaction.customId.startsWith('$')) {
            console.log(interaction.customId);
            const svcInfo = getSvcInfo(interaction.customId);
            if (svcInfo.length) {
                if (fs.existsSync(path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]) + '.js'))
                    await require(path.join(rootPath, 'dist', 'features', svcInfo[0]))(interaction, svcInfo);
                else {
                    console.log('service failed: ' + interaction.customId);
                    await interaction.reply({ ephemeral: true, content: 'service not found' });
                }
            } else {
                if (interaction.isButton()) await button(interaction);
                else if (interaction.isModalSubmit()) await modal(interaction);
                else if (interaction.isAnySelectMenu()) await menu(interaction);
            }
        } else {
            if (shouldLogIgnoredCustomID) console.log(interaction.customId);
        }
    }
};

export = create;