import { ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { deleteAfterSec } from "../../functions/discord/message";

const orderSubmit = async (interaction: ModalSubmitInteraction, orderlist: OrderList): Promise<void> => {
    try {
        await interaction.deferUpdate();
        const [content, price] = [interaction.components[0].components[0].value, interaction.components[1].components[0].value];

        const member = orderlist.getMember(interaction.user.id);
        if (member) {
            member.setContent(content);
            if (!Number.isNaN(price))
                member.setPrice(parseInt(price));
            interaction.reply(OrderList.orderSucceedRpMsg())
                .then(msg => { })
                .catch(e => console.log);
        } else
            interaction.reply(OrderList.orderFailedRpMsg())
                .then(msg => { })
                .catch(e => console.log);


        await interaction.message?.edit({
            embeds: [orderlist.board()],
            components: orderlist.panel()
        });

    } catch (e) { }

}

export = orderSubmit;