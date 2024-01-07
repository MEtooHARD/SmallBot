import { StringSelectMenuBuilder } from "discord.js";
import Option from "./StringMenuOption";

class Menu extends StringSelectMenuBuilder {
    constructor({customId, placeholder, options}:
        {customId: string, placeholder: string, options: Option[]}) {
        super();
        this.setCustomId(customId);
        this.setPlaceholder(placeholder);
        this.setOptions(options);
    }
}

export = Menu;