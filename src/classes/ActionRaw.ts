import { ActionRowBuilder, AnyComponentBuilder } from 'discord.js';
import Button from './ActionRow/Button';
import Menu from './ActionRow/StringSelectMenu';

class ActionRow extends ActionRowBuilder {
    constructor({ buttons, menus }:
        { buttons?: Button[], menus?: Menu[] }) {
        super();
        if (buttons) this.addComponents(buttons.map(button => button));
        if (menus) this.addComponents(menus.map(menu => menu));
    }
}

export { ActionRow, Button, Menu }