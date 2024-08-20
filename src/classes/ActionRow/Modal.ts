import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export type Modal = {
    customId: string;
    title: string;
    components: [];
}

export class TextInput extends TextInputBuilder {
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

interface TextInputData {
    customId: string,
    label: string,
    placeholder?: string,
    required?: boolean,
    style?: TextInputStyle,
    value?: string,
    maxLength?: number,
    minLength?: number
}

export class TextInputRow extends ActionRowBuilder<TextInput> {
    constructor(data: TextInputData) {
        super();
        this.addComponents([new TextInput(data)]);
    }
}