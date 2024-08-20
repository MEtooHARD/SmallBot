import { ButtonInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const refresh = async (interaction: ButtonInteraction, svcInfo: string[]) => {
  // const document = await ReferendumModel.findById(svcInfo[2]);
  // if (document) {
  //     // console.log(document);
  //     document.proposals.forEach(proposal => {
  //         proposal.advocates = 0;
  //         proposal.opponents = 0;
  //     })
  //     document.users = [];
  //     document.sessions.clear();
  //     document.stage = Referendum.Stage.ACTIVE;
  //     // console.log(document);
  //     await document.save();
  //     await interaction.update(new Referendum(document).getMessage());
  // }
}

export = refresh;