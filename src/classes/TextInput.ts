import { TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

class TextInput extends ActionRowBuilder {
    constructor({ customId, label, maxlength, minlength, placeholder, required = false, style = TextInputStyle.Short, value }:
        { customId: string, label: string, maxlength: number, minlength: number, placeholder: string, required: boolean, style: TextInputStyle, value: string }) {
        super();
        const TI = new TextInputBuilder();
        TI.setStyle(style);
        TI.setRequired(required);
        if (label) TI.setLabel(label);
        if (value) TI.setValue(value);
        if (customId) TI.setCustomId(customId);
        if (maxlength) TI.setMaxLength(maxlength);
        if (minlength) TI.setMinLength(minlength);
        if (placeholder) TI.setPlaceholder(placeholder);
        this.addComponents(TI);
    }
}

export = TextInput;