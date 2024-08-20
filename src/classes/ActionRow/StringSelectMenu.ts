import { StringSelectMenuBuilder } from "discord.js";
import StringOption from "./StringMenuOption";

class Menu extends StringSelectMenuBuilder {
  constructor({ customId, placeholder, options }:
    { customId: string, placeholder: string, options: StringOption[] }) {
    super();
    this.setCustomId(customId);
    this.setPlaceholder(placeholder);
    this.setOptions(options);
  }
}

export = Menu;