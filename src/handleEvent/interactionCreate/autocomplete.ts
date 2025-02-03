import { AutocompleteInteraction } from 'discord.js';
import { SlashCommands } from '../..';

const autocomplete = (interaction: AutocompleteInteraction) => {
    const command = SlashCommands.get(interaction.commandName);
    if (command?.complete) command.complete(interaction);
}

export = autocomplete;