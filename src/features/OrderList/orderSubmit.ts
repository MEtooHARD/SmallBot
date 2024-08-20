import { ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import chalk from "chalk";

const orderSubmit = async (interaction: ModalSubmitInteraction, orderlist: OrderList): Promise<void> => {
    console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
        '\n\tsubmitted' + chalk.yellow(interaction.customId));

    try {
        await interaction.deferUpdate();
        const [content, price] = [interaction.components[0].components[0].value, interaction.components[1].components[0].value];

        const member = orderlist.getMember(interaction.user.id);
        if (member) {
            member.setContent(content);
            if (!Number.isNaN(price))
                member.setPrice(Number(price));
        }

        await interaction.message?.edit({
            embeds: [orderlist.board()],
            components: orderlist.panel()
        });
    } catch (e) {
        console.log(chalk.red('order submittion'));
        console.log(e);
    }

}

export = orderSubmit;