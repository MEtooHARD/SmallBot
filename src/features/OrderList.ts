import { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";

const OrderList = async (interaction: ButtonInteraction | ModalSubmitInteraction | AnySelectMenuInteraction, svcInfo: string[]) => {
  await require(`./OrderList/${svcInfo[1]}`)(interaction, svcInfo);
};

export = OrderList;