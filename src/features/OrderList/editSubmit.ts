import { ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import chalk from "chalk";

const editSubmit = async (interaction: ModalSubmitInteraction, orderlist: OrderList) => {
  console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
    '\n\tsubmitted' + chalk.yellow(interaction.customId));

  try {
    const response = await interaction.deferUpdate();
    const [restaurant, description] = [interaction.components[0].components[0].value, interaction.components[1].components[0].value];
    orderlist.setRestaurant(restaurant);
    orderlist.setDescription(description);

    await response.edit({
      embeds: [orderlist.board()],
      components: orderlist.panel()
    });

  } catch (e) {
    console.log('edit submit');
    console.log(e)
  }
}

export = editSubmit;