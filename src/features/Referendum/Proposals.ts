import { GuildMember, StringSelectMenuInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const Proposals = async (interaction: StringSelectMenuInteraction, svcInfo: string[]) => {
    const document = await ReferendumModel.findById(svcInfo[2]);
    if (document) {
        const referendum = new Referendum(document);
        if (referendum.entitled(interaction.member as GuildMember)) {
            await interaction.showModal(referendum.getModifyProposalModal(interaction.values[0]));
        } else {
            await interaction.reply({
                ephemeral: true,
                content: "You're not entitled to this, don\'t you even get a single eye?"
            });
        }
    } else
        await interaction.reply({ ephemeral: true, content: 'data not found' });
};

export = Proposals;