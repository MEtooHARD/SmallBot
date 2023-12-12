import { AnySelectMenuInteraction } from 'discord.js';
import Log from '../../../classes/Log';

const menu = (interaction: AnySelectMenuInteraction) => {
    const log = new Log({event: 'menu', user: interaction.user});

}

export = menu;