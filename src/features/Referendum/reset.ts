import { ButtonInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const refresh = async (interaction: ButtonInteraction, svcInfo: string[]) => {
    const document = await ReferendumModel.findById(svcInfo[2]);
    if (document) {
        document.proposals.forEach(proposal => {
            proposal.advocates = 0;
            proposal.opponents = 0;
        })
        document.users = [];
        document.stage = Referendum.Stage.ACTIVE;
        await document.save();
        await interaction.update(new Referendum(document).getMessage());
    }
}

export = refresh;