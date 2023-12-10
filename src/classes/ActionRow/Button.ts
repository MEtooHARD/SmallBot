import { ButtonBuilder, ButtonStyle } from "discord.js";

class Button extends ButtonBuilder {
    constructor({ customId, label, style, url, disabled, emoji }:
        { customId: string, label: string, style: ButtonStyle, url: string, disabled: boolean, emoji: string }) {
        super();
        if (url) this.setURL(url);
        if (label) this.setLabel(label);
        if (style) this.setStyle(style);
        if (emoji) this.setEmoji(emoji);
        if (customId) this.setCustomId(customId);
        if (disabled) this.setDisabled(disabled);
    }
}

export = Button;