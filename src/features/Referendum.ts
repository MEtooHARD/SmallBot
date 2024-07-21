import { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { connectionStatus } from "../mongoose";
import { ConnectionStates } from "mongoose";

const Referendum = async (interaction: ButtonInteraction | ModalSubmitInteraction | AnySelectMenuInteraction, svcInfo: string[]) => {
    if (connectionStatus.connectionState !== ConnectionStates.connected) {
        await interaction.reply('Service currently unavailable.');
        return;
    }
    await require(`./Referendum/${svcInfo[1]}`)(interaction, svcInfo);
};

export = Referendum;