import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import editSubmit from "./editSubmit";

const end = (interaction: ButtonInteraction, orderlist: OrderList) => {
    try {
        if (interaction.user.id === orderlist.organizer.id) {
            interaction.showModal(orderlist.editModal());

            const filter = (i: ModalSubmitInteraction): boolean => {
                const svcI = getSvcInfo(i.customId)
                return svcI[0] == OrderList.serviceCustomID && svcI[1] === 'edit' && i.user.id === interaction.user.id;
            }

            interaction.awaitModalSubmit({ filter: filter, time: 5 * 60 * 1000 })
                .then(i => {
                    editSubmit(i, orderlist)
                })
                .catch(console.error);
        } else {
            interaction.reply(OrderList.notOrganizerRpMsg());
        }

    } catch (e) { console.log(e); }
}

export = end;