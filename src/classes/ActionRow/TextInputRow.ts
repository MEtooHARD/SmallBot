import { ActionRowBuilder } from 'discord.js';
import TextInput from './TextInput';

class TextInputRow extends ActionRowBuilder<TextInput> {
    constructor(textInput: TextInput) {
        super();
        this.setComponents([textInput]);
    }
}

export = TextInputRow;