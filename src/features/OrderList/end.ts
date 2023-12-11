import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";

const edit = async (interaction: ButtonInteraction, orderlist: OrderList) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.user.id === orderlist.organizer.id) {
            const collector = (await interaction.editReply(OrderList.endCheckRpMsg())).createMessageComponentCollector();

            collector.on('collect', async i => {
                try {
                    await i.update(OrderList.endRpMsg())
                    await interaction.message.delete();
                    interaction.channel?.send({
                        embeds: [orderlist.board(true)]
                    });
                } catch (e) { console.log(e) }
            })
        } else {
            interaction.editReply(OrderList.notOrganizerRpMsg());
        }

    } catch (e) { console.log(e); }
}

export = edit;