import { ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";

const editSubmit = async (interaction: ModalSubmitInteraction, orderlist: OrderList) => {
    try {
        await interaction.deferUpdate();
        const [restaurant, description] = [interaction.components[0].components[0].value, interaction.components[1].components[0].value];
        orderlist.setRestaurant(restaurant);
        orderlist.setDescription(description);

        // interaction.editReply(OrderList.editSuccessRpMsg());
        interaction.editReply({
            embeds: [orderlist.board()],
            components: orderlist.panel()
        });
    } catch (e) { console.log(e) }
}

export = editSubmit;