import { ModalSubmitInteraction, TextChannel } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const SubmitModification = async (interaction: ModalSubmitInteraction, svcInfo: string[]) => {
  try {
    await interaction.reply({ ephemeral: true, content: 'recieved.' });

    const document = await ReferendumModel.findById(svcInfo[2]);

    if (document) {
      const message = await (interaction.channel as TextChannel).messages
        .fetch(document.message.messageId);

      document.title = interaction.fields.getTextInputValue(Referendum.OverviewFields.TITLE);
      document.description = interaction.fields.getTextInputValue(Referendum.OverviewFields.DESCRIPTION);
      await document.save();
      await message.edit(new Referendum(document).getMessage());
    } else
      await interaction.followUp('data not dound');
  } catch (e) {
    console.log(e);
    interaction.followUp({ ephemeral: true, content: 'something went wrong.' })
  }
};

export = SubmitModification;