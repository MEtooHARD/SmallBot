import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import { getSvcInfo } from "../../functions/discord/service";
import editSubmit from "./editSubmit";
import chalk from "chalk";

const end = async (interaction: ButtonInteraction, orderlist: OrderList) => {
  console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
    '\n\tused' + chalk.yellow(interaction.customId));

  try {
    if (interaction.user.id === orderlist.organizer.id) {
      await interaction.showModal(orderlist.editModal());

      const filter = (i: ModalSubmitInteraction): boolean => {
        const svcI = getSvcInfo(i.customId)
        return svcI[0] == OrderList.serviceCustomID && svcI[1] === 'edit' && i.user.id === interaction.user.id;
      }

      interaction.awaitModalSubmit({ filter: filter, time: 5 * 60 * 1000 })
        .then(i => {
          editSubmit(i, orderlist)
        })
        .catch(e => {
          console.log(chalk.red('awaiting edit submit'));
          console.log(e);
        });
    } else {
      await interaction.reply(OrderList.notOrganizerRpMsg());
    }

  } catch (e) {
    console.log(chalk.red('edit'));
    console.log(e)
  }
}

export = end;