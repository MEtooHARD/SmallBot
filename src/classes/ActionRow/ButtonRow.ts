import { ActionRowBuilder } from 'discord.js';
import Button from './Button';

class ButtonRow extends ActionRowBuilder<Button> {
    constructor(buttons: Button[]) {
        super();
        if (buttons.length > 5) {
            buttons = buttons.slice(0, 5);
            throw new Error('more than 5 buttons in an actionrow.');
        }
        this.setComponents(buttons.map(button => button));
    }
}

export = ButtonRow;