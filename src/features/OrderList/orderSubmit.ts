import { ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { deleteAfterSec } from "../../functions/discord/message";

const orderSubmit = async (interaction: ModalSubmitInteraction, orderlist: OrderList): Promise<void> => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const [content, price] = [interaction.components[0].components[0].value, interaction.components[1].components[0].value];

        const member = orderlist.getMember(interaction.user.id);
        if (member) {
            member.setContent(content);
            if (!Number.isNaN(price))
                member.setPrice(Number(price));
            interaction.editReply(OrderList.orderSucceedRpMsg())
                .then(msg => { })
                .catch(console.log);
        } else
            interaction.editReply(OrderList.orderFailedRpMsg())
                .then(msg => { })
                .catch(console.log);


        await interaction.message?.edit({
            embeds: [orderlist.board()],
            components: orderlist.panel()
        });

    } catch (e) { }

}

export = orderSubmit;