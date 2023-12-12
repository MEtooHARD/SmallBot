import { ButtonInteraction, GuildMember, Message, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import orderSubmit from "./orderSubmit";
import chalk from "chalk";

const order = async (interaction: ButtonInteraction, orderlist: OrderList) => {
    console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
        '\n\tused' + chalk.yellow(interaction.customId));

    try {
        if (interaction.member instanceof GuildMember) {
            orderlist.addMember(interaction.member);

            await interaction.showModal(orderlist.orderModal(interaction.user.id));

            const filter = (i: ModalSubmitInteraction): boolean => {
                const svcI = getSvcInfo(i.customId)
                return svcI[0] == OrderList.serviceCustomID && svcI[1] === 'order' && i.user.id === interaction.user.id;
            }

            interaction.awaitModalSubmit({ filter: filter, time: 5 * 60 * 1000 })
                .then(i => {
                    orderSubmit(i, orderlist)
                })
                .catch(e => {
                    console.log(chalk.red('awaiting order submit'));
                    // console.log(e);
                });
        } else {
            interaction.update({
                embeds: [orderlist.board()],
                components: orderlist.panel()
            });
        }
    } catch (e) {
        console.log(chalk.red('order'));
        console.log(e);
    }
}

export = order;