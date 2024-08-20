import { ButtonInteraction, Collection, Collector, ModalSubmitInteraction } from "discord.js";
import OrderList from "../../classes/OrderList";
import chalk from "chalk";

const edit = async (interaction: ButtonInteraction, orderlist: OrderList, end: Function) => {
  console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
    '\n\tused ' + chalk.yellow(interaction.customId));

  try {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.user.id === orderlist.organizer.id) {
      const collector = (await interaction.editReply(OrderList.endCheckRpMsg())).createMessageComponentCollector({ max: 1 });

      collector.on('collect', async i => {
        console.log(chalk.green(interaction.user.username) + ': ' + chalk.cyan(interaction.user.id) +
          '\n\tused\n\t' +
          chalk.yellow(interaction.customId));

        try {
          await i.update(OrderList.endRpMsg());
          end();
        } catch (e) { console.log(e) }
      })

      collector.on('end', (collected, reason) => {
        console.log(`${chalk.green('[' + OrderList.serviceName + ']')}[end][button] ended. Reason: ${chalk.yellow(reason)}`)
      });
    } else {
      interaction.editReply(OrderList.notOrganizerRpMsg());
    }
  } catch (e) {
    console.log(chalk.red('end'));
    console.log(e)
  }
}

export = edit;