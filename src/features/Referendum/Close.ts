import { ButtonInteraction, ButtonStyle, Colors } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";
import { ButtonDialog } from "../../classes/ButtonDialog";

const Close = async (interaction: ButtonInteraction, svcInfo: string[]) => {
  if (interaction.user.id === svcInfo[2]) {
    const document = await ReferendumModel.findById(svcInfo[3]);
    if (document) {
      const dialog = new ButtonDialog({ interaction: interaction });
      try {
        const response = await dialog.awaitResponse({
          header: {
            color: Colors.DarkRed,
            title: 'This process is IRREVERSIBLE.',
            description: 'Are you sure to close this referendum?'
          },
          options: [
            {
              customId: '$y',
              style: ButtonStyle.Success,
              label: 'Close'
            }, {
              customId: '$n',
              style: ButtonStyle.Secondary,
              label: 'Cancel'
            }
          ],
          ephemeral: true,
          idle: 60 * 1000,
        })
        if (response.customId === '$y') {
          document.closedAt = Date.now();
          document.stage = Referendum.Stage.CLOSED;
          await document.save();
          await interaction.message.edit(new Referendum(document).getMessage());
        }
      } catch (e) { await interaction.reply({ ephemeral: true, content: 'something went wrong.' }); }
    } else {
      await interaction.reply({ ephemeral: true, content: 'data not found.' });
    }
  } else {
    await interaction.reply({ ephemeral: true, content: 'You are not granted to do this.' })
  }
};

export = Close;