import { ModalBuilder } from "discord.js";
import TextInputRow from "./ActionRow/TextInputRow";

class Modal extends ModalBuilder {
    constructor({ customId, title, components }:
        { customId: string, title: string, components: TextInputRow[] }) {
        super();
        this.setCustomId(customId);
        this.setTitle(title);
        if (components) this.addComponents(...components);
    }
}

export = Modal