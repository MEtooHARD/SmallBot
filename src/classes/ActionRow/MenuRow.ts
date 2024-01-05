import { ActionRowBuilder } from 'discord.js';
import Menu from './StringSelectMenu';

class MenuRow extends ActionRowBuilder<Menu> {
    constructor(menu: Menu) {
        super();
        this.setComponents([menu]);
    }
}

export = MenuRow;