import { ModalSubmitInteraction } from 'discord.js';
import Log from '../../../classes/Log';

const modal = (interaction: ModalSubmitInteraction) => {
    console.log('modal');
    const log = new Log({event: 'modal', user: interaction.user});

}

export = modal;