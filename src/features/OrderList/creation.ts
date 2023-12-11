import { ButtonInteraction, ComponentType, Guild, GuildMFALevel, GuildMember, ModalSubmitInteraction } from "discord.js";
import Log from "../../classes/Log";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import order from "./order";
import end from "./end";
import edit from "./edit";

const creation = async (interaction: ModalSubmitInteraction, svcInfo: string[], log: Log) => {
    const orderlist = new OrderList(interaction.user, interaction.client);

    orderlist.setRestaurant(interaction.components[0].components[0].value);
    if (interaction?.components[1]?.components[0])
        orderlist.setDescription(interaction.components[1].components[0].value);

    const collector = (await interaction.reply({
        embeds: [orderlist.board()],
        components: orderlist.panel(),
        fetchReply: true
    })).createMessageComponentCollector({
        componentType: ComponentType.Button,
        idle: 2 * 60 * 60 * 1000
    });

    collector.on('collect', (interaction: ButtonInteraction) => {
        const svcIf = getSvcInfo(interaction.customId);
        if (svcIf.length)
            switch (svcIf[1]) {
                case 'order':
                    order(interaction, orderlist);
                    break;
                case 'end':
                    end(interaction, orderlist);
                    break;
                case 'edit':
                    edit(interaction, orderlist);
            }
    })

    collector.on('ignore', i => { console.log('[order] ignored ' + i.user.id) });
    // collector.on('dispose', i => { console.log('d') });
    collector.on('end', i => { console.log('[order] ended at ' + interaction.guild?.name) });
}

export = creation;