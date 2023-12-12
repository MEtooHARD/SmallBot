import { StringSelectMenuOptionBuilder } from "discord.js";

class Option extends StringSelectMenuOptionBuilder {
    constructor({ isDefault = false, description = '', emoji = '', label, value }:
        { isDefault: boolean, description: string, emoji: string, label: string, value: string }) {
        super();
        this.setDefault(isDefault);
        this.setLabel(label);
        this.setValue(value);
        this.setDescription(description);
        this.setEmoji(emoji);
    }
}

export = Option;
