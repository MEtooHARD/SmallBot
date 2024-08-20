import { StringSelectMenuOptionBuilder } from "discord.js";

class StringOption extends StringSelectMenuOptionBuilder {
  constructor({ isDefault = false, description, emoji, label, value }:
    { isDefault?: boolean, description?: string, emoji?: string, label: string, value: string }) {
    super();
    this.setDefault(isDefault);
    this.setLabel(label);
    this.setValue(value);
    if (description) this.setDescription(description);
    if (emoji) this.setEmoji(emoji);
  }
}

export = StringOption;
