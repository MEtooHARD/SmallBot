import { AutocompleteInteraction, ButtonInteraction, Events } from 'discord.js';
import Log from '../../../classes/Log';

const autocomplete = (interaction: AutocompleteInteraction) => {
    console.log('autocomplete');
    const log = new Log({event: 'autocomplete', user: interaction.user});
    
}

export = autocomplete;