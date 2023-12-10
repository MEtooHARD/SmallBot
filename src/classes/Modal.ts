import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "discord.js";
// import TextInput from "./TextInput";

class Modal extends ModalBuilder {
    constructor({customId, title, components}:
        {customId: string, title: string, components: ActionRowBuilder<TextInputBuilder>[]}) {
        super();
        this.setCustomId(customId);
        this.setTitle(title);
        if(components)  this.addComponents(...components);
    }
}

module.exports.Modal = Modal