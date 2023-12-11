import { ModalSubmitInteraction } from "discord.js";
import Log from "../../classes/Log";
import OrderList from "../../classes/OrderList";

const creation = (interaction: ModalSubmitInteraction, svcInfo: string[], log: Log) => {
    const orderlist = new OrderList();
}

export = creation;