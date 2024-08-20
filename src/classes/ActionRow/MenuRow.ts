import { ActionRowBuilder } from 'discord.js';
import Menu from './StringSelectMenu';

export class MenuRow extends ActionRowBuilder<Menu> {
  constructor(menu: Menu) {
    super();
    this.setComponents([menu]);
  }
}