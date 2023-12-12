import { ButtonInteraction, Events } from 'discord.js';
import Log from '../../../classes/Log';

const button = (interaction: ButtonInteraction) => {
    const log = new Log({event: 'button', user: interaction.user});
    
}

export = button;