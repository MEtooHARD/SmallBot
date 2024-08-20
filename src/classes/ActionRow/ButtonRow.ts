import { ActionRowBuilder } from 'discord.js';
import { Button, ButtonOptions } from './Button';

class ButtonRow extends ActionRowBuilder<Button> {
  constructor(buttons: Button[] | ButtonOptions[]) {
    super();
    // if (buttons.length > 5) {
    //     buttons = buttons.slice(0, 5);
    //     throw new Error('more than 5 buttons in an actionrow.');
    // }
    for (const button of buttons)
      if (button instanceof Button)
        this.addComponents(button);
      else
        this.addComponents(new Button(button));
  }
}

export = ButtonRow;