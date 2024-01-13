import { Interaction } from 'discord.js';

import menu from './create/menu';
import modal from './create/modal';
import button from './create/button';
import command from './create/comand';
import autocomplete from './create/autocomplete';

const create = async (interaction: Interaction): Promise<void> => {
    if (interaction.isCommand()) command(interaction);
    else if (interaction.isButton()) button(interaction);
    else if (interaction.isModalSubmit()) modal(interaction);
    else if (interaction.isAnySelectMenu()) menu(interaction);
    else if (interaction.isAutocomplete()) autocomplete(interaction);
}

export = create;