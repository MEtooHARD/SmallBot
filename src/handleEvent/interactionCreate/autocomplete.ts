import { AutocompleteInteraction } from 'discord.js';
import { CM } from '../..';

const autocomplete = (interaction: AutocompleteInteraction) => {
    const command = CM.get(interaction.commandName);
    if (command?.complete) command.complete(interaction);
}

export = autocomplete;