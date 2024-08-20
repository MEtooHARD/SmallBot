import { ButtonStyle, Collection, Colors, GuildMember, StringSelectMenuInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";
import { ButtonDialog } from "../../classes/ButtonDialog";
import { MessageDialog } from "../../classes/MessageDialog";
import { addElements, removeElements } from "../../functions/general/array";

const settings = async (interaction: StringSelectMenuInteraction, svcInfo: string[]) => {
  // fetch doc
  const document = await ReferendumModel
    .findById(svcInfo[2], { title: 1, description: 1, entitled: 1, createdBy: 1, proposals: 1, stage: 1, users: 1 });
  // check doc
  if (document) {
    const referendum = new Referendum(document);
    // check permission
    if (referendum.entitled(interaction.member as GuildMember)) {
      switch (interaction.values[0]) {
        case Referendum.CheckList.Title_Description:
          await interaction.showModal(referendum.getModifyOverviewModal());
          break;
        case Referendum.CheckList.Entitled:
          const btnDialog = new ButtonDialog({ interaction: interaction });
          try {
            const response = await btnDialog.awaitResponse({
              header: { color: Colors.Yellow, title: 'To remove or add?' },
              options: [
                { customId: '$rm', label: 'Remove', style: ButtonStyle.Danger },
                { customId: '$ad', label: 'Add', style: ButtonStyle.Success }
              ],
              ephemeral: true,
              idle: 20 * 1000
            });
            const mode = response.customId === '$rm';
            const msgDialog = new MessageDialog({ interaction: response });
            const res = await msgDialog.awaitResponse({
              header: {
                title: `mode: ${mode ? 'remove' : 'add'}`,
                description: 'mention(tag) some members or roles.'
              },
              UID: interaction.user.id,
              ephemeral: true,
              idle: 2 * 60 * 1000
            });
            const mentioned = (res.mentions.members as Collection<string, GuildMember>).map(member => member.id).filter(id => id !== document.createdBy)
              .concat(res.mentions.roles.map(role => `&${role.id}`));
            if (mode) removeElements(document.entitled, mentioned);
            else addElements(document.entitled, mentioned);
            document.markModified('entitled');
            await document.save();
            await interaction.message.edit(referendum.getMessage());
            await interaction.followUp({ content: 'updated.', ephemeral: true });
          } catch (e) { console.log(e); };
      }
    } else {
      await interaction.reply({
        ephemeral: true,
        content: "You're not entitled to this, don\'t you even get a single eye?"
      });
    }
  } else
    await interaction.reply({ ephemeral: true, content: 'seems the data is gone.' });
};

export = settings;