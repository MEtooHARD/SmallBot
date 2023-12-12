import { TextInputBuilder, TextInputStyle } from "discord.js";

class TextInput extends TextInputBuilder {
    constructor({ customId, label, placeholder = '', required = false, style = TextInputStyle.Short, value, maxLength, minLength }:
        { customId: string, label: string, placeholder?: string, required?: boolean, style?: TextInputStyle, value?: string, maxLength?: number, minLength?: number }) {
        super();
        this.setLabel(label);
        this.setCustomId(customId);
        this.setPlaceholder(placeholder);
        this.setStyle(style);
        this.setRequired(required);
        if (value) this.setValue(value);
        if (maxLength) this.setMaxLength(maxLength);
        if (minLength) this.setMinLength(minLength);
    }
}
export = TextInput;