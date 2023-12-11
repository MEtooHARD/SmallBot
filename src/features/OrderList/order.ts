import { ButtonInteraction, GuildMember, Message, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import orderSubmit from "./orderSubmit";

const order = (interaction: ButtonInteraction, orderlist: OrderList) => {
    if (interaction.member instanceof GuildMember) orderlist.addMember(interaction.member);

    interaction.showModal(orderlist.orderModal(interaction.user.id));
    const filter = (i: ModalSubmitInteraction): boolean => {
        const svcI = getSvcInfo(i.customId)
        return svcI[0] == OrderList.serviceCustomID && svcI[1] === 'order' && i.user.id === interaction.user.id;
    }

    interaction.awaitModalSubmit({ filter: filter, time: 5 * 60 * 1000 })
        .then(i => {
            orderSubmit(i, orderlist)
        })
        .catch(console.error);
}

export = order;