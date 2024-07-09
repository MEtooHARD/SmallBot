import { ModalSubmitInteraction } from "discord.js";

const creation = async (interaction: ModalSubmitInteraction, svcInfo: string[]) => {
    interaction.reply('recieved');
}

export = creation;