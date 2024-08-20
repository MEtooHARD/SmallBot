import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const Vote = async (interaction: ButtonInteraction, svcInfo: string[]) => {
  await interaction.deferReply({ ephemeral: true });

  try {
    let document = await ReferendumModel.findById(svcInfo[2], { _id: 1, proposals: 1, users: 1, sessions: 1 });
    if (!document) throw '$data not found';
    if (document.users.includes(interaction.user.id)) throw '$you have voted.';
    // new session
    const voter = new Referendum.Voter(svcInfo[2], document.proposals);
    await ReferendumModel.updateOne({ _id: svcInfo[2] },
      { $set: { [`sessions.${interaction.user.id}`]: voter.uuid } });

    const rp = await interaction.editReply(voter.getMessage());

    const collector = rp.createMessageComponentCollector({
      time: Referendum.Voter.time,
      idle: Referendum.Voter.idle,
      filter: i => i.message.id === rp.id
    });

    collector.on('collect', async i => {
      if (i.customId !== '$O') {
        if (i instanceof StringSelectMenuInteraction) {
          voter.selected = Number(i.values[0]);
        } else if (i instanceof ButtonInteraction) {
          switch (i.customId) {
            case '$A':
              voter.proposals[voter.selected].choice = Referendum.Ballot.AGREE;
              break;
            case '$N':
              voter.proposals[voter.selected].choice = Referendum.Ballot.NUETRAL;
              break;
            case '$D':
              voter.proposals[voter.selected].choice = Referendum.Ballot.DISAGREE;
              break;
            case '$S':
              voter.submit = true;
              break;
            case '$X':
              voter.submit = false;
              break;
          }
        }
        await i.update(voter.getMessage());
      } else {
        document = await ReferendumModel.findById(svcInfo[2], { sessions: 1, users: 1 });
        if (document) {
          if (document.sessions.get(interaction.user.id) === voter.uuid
            && !document.users.includes(interaction.user.id)) {
            await ReferendumModel.updateOne({ _id: svcInfo[2] }, {
              $inc: voter.genIncObj(),
              $push: { users: interaction.user.id }
            })
            await i.update({ content: 'Vote counted. Every vote matters!', embeds: [], components: [] })
          } else
            await i.update({ content: 'Vote not counted. This session is expired.\nRequest a new one if you have not voted.', embeds: [], components: [] });
        } else
          i.update({ content: 'seems the data fucked', embeds: [], components: [] });

        document = await ReferendumModel.findById(svcInfo[2], { sessions: 0 });
        if (document)
          await interaction.message.edit(new Referendum(document).getMessage());
        collector.stop('submit');
      }
    });

    collector.on('end', async (c, r) => {
      if (r === 'idle' || r === 'submit') {
        document = await ReferendumModel.findById(svcInfo[2], { sessions: 1 });
        if (document && document.sessions.get(interaction.user.id) === voter.uuid)
          await ReferendumModel.updateOne({ _id: svcInfo[2] }, {
            $unset: { [`sessions.${interaction.user.id}`]: '' }
          });
      }
    });
  } catch (e) {
    if (typeof e === 'string' && e.startsWith('$'))
      await interaction.editReply(e.slice(1));
    else
      console.log(e);
  }
};

export = Vote;