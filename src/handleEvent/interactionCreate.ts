import { Interaction } from 'discord.js';
import menu from './interactionCreate/menu';
import modal from './interactionCreate/modal';
import button from './interactionCreate/button';
import command from './interactionCreate/command';
import autocomplete from './interactionCreate/autocomplete';

const create = async (interaction: Interaction): Promise<void> => {
    if (interaction.isCommand())
        command(interaction);
    else if (interaction.isAutocomplete())
        autocomplete(interaction);
    else {
        if (!interaction.customId.startsWith('$')) {
            console.log(interaction.customId);
            if (interaction.isButton()) button(interaction);
            else if (interaction.isModalSubmit()) modal(interaction);
            else if (interaction.isAnySelectMenu()) menu(interaction);
        }
    }
};

export = create;