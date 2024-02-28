import { ButtonInteraction } from "discord.js";

export class ButtonInteractionHandler {
    name: string;
    filter = (interaction: ButtonInteraction): boolean => { return interaction.customId === this.name };
    handle = async (interaction: ButtonInteraction): Promise<void> => { };
    constructor(name: string) {
        this.name = name;
    }
};