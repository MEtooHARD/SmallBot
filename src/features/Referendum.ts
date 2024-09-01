import { AnySelectMenuInteraction, ButtonInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { connectionStatus } from "../mongoose";
import { ConnectionStates } from "mongoose";

export const Referendum = async (interaction: MessageComponentInteraction, svcInfo: string[]) => {
    if (connectionStatus.connectionState !== ConnectionStates.connected) {
        await interaction.reply('Service currently unavailable.');
        return;
    }
    await require(`./Referendum/${svcInfo[1]}`)(interaction, svcInfo);
};
