import { AutocompleteInteraction } from 'discord.js';
import { SlashCommands } from '../../utilities';

export const handleAutoComplete = (interaction: AutocompleteInteraction) => {
    const command = SlashCommands.get(interaction.commandName);
    if (command?.complete) command.complete(interaction);
}
