import { ButtonBuilder, ButtonStyle } from "discord.js";

export interface ButtonOptions {
    customId: string,
    label: string,
    style: ButtonStyle,
    url?: string,
    disabled?: boolean,
    emoji?: string
}

export class Button extends ButtonBuilder {
    constructor({ customId, label, style, url, disabled, emoji }: ButtonOptions) {
        super();
        if (url) this.setURL(url);
        if (label) this.setLabel(label);
        if (style) this.setStyle(style);
        if (emoji) this.setEmoji(emoji);
        if (customId) this.setCustomId(customId);
        if (disabled) this.setDisabled(disabled);
    }
}
