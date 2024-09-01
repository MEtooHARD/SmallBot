import { AnySelectMenuInteraction, ButtonInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

export const OrderList = async (interaction: MessageComponentInteraction, svcInfo: string[]) => {
    await require(`./OrderList/${svcInfo[1]}`)(interaction, svcInfo);
};
