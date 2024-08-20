import { Colors, ModalSubmitInteraction, TextChannel } from "discord.js";
import { Referendum } from "../../classes/Referendum";
import { ReferendumModel } from "../../models/ReferendumModel";

const creation = async (interaction: ModalSubmitInteraction<'cached'>, svcInfo: string[]) => {
  await interaction.reply({
    ephemeral: true,
    embeds: [{ color: Colors.Green, description: 'Recieved.' }]
  });

  const document = new ReferendumModel({
    title: interaction.fields.getTextInputValue(Referendum.OverviewFields.TITLE),
    description: interaction.fields.getTextInputValue(Referendum.OverviewFields.DESCRIPTION),
    stage: Referendum.Stage.PREPARING,
    createdBy: interaction.user.id,
    users: [],
    voting: [],
    entitled: [],
    proposals: [],
  });

  const referendum = new Referendum(document);

  const message = await (interaction.channel as TextChannel).send(referendum.getMessage());

  referendum.setMessage(message);

  try {
    await document.save();

    await interaction.followUp({
      ephemeral: true,
      content: 'Data saved.'
    });
  } catch (e) {
    console.log(e);
  };
};

export = creation;