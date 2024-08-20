import { ButtonInteraction, ComponentType, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import order from "./order";
import end from "./end";
import edit from "./edit";
import chalk from "chalk";

const creation = async (interaction: ModalSubmitInteraction, svcInfo: string[]) => {
    console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
        '\n\tsubmitted' + chalk.yellow(interaction.customId));

    const orderlist = new OrderList(interaction.user/* , interaction.client */);

    orderlist.setRestaurant(interaction.components[0].components[0].value);
    if (interaction?.components[1]?.components[0])
        orderlist.setDescription(interaction.components[1].components[0].value);

    const rpMesage = await interaction.reply({
        embeds: [orderlist.board()],
        components: orderlist.panel(),
        fetchReply: true
    });

    const collector = rpMesage.createMessageComponentCollector({
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
                    end(interaction, orderlist, () => collector.emit('end'));
                    break;
                case 'edit':
                    edit(interaction, orderlist);
            }
    })

    collector.on('ignore', i => { console.log('[order] ignored ' + i.user.id) });
    // collector.on('dispose', i => { console.log('d') });
    collector.on('end', async (collection, reason: string) => {
        console.log(chalk.red('end') + chalk.yellow(` [${OrderList.serviceName}]`));
        try {
            await rpMesage.delete();
            interaction.channel?.send({
                embeds: [orderlist.board(true)]
            });
        } catch (e) {
            console.log('end order list');
            console.log(e);
        }
    });
}

export = creation;