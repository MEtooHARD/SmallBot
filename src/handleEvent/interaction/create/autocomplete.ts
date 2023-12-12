import { AutocompleteInteraction, ButtonInteraction, Events } from 'discord.js';
import Log from '../../../classes/Log';
import { getSvcDir } from '../../../functions/discord/service';

const autocomplete = (interaction: AutocompleteInteraction) => {
    const log = new Log({event: 'autocomplete', user: interaction.user});
}

export = autocomplete;