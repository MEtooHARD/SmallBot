import { ModalSubmitInteraction, TextChannel } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const SubmitProposal = async (interaction: ModalSubmitInteraction, svcInfo: string[]) => {
    await interaction.reply({ ephemeral: true, content: 'recieved.' });

    const document = await ReferendumModel.findById(svcInfo[3]);
    if (document) {
        const referendum = new Referendum(document);
        const newTitle = interaction.fields.getTextInputValue(Referendum.ProposalFields.TITLE);
        const newDescription = interaction.fields.getTextInputValue(Referendum.ProposalFields.DESCRIPTION);
        const newPurpose = interaction.fields.getTextInputValue(Referendum.ProposalFields.PURPOSE);
        const newProposer = interaction.fields.getTextInputValue(Referendum.ProposalFields.PROPOSER);
        let nonEmpty = newTitle || newDescription || newPurpose || newProposer;

        if (svcInfo[2] === '+') {
            if (nonEmpty)
                document.proposals.push({
                    title: newTitle || '--',
                    description: newDescription || '--',
                    purpose: newPurpose || '--',
                    proposer: newProposer || '--',
                    uploader: interaction.user.id,
                    advocates: 0,
                    opponents: 0
                });
        } else {
            const index = Number(svcInfo[2]);
            if (document.proposals.length <= index) {
                await interaction.followUp({ ephemeral: true, content: 'something went wrong. try again' });
            } else if (nonEmpty) {
                document.proposals[index].title = newTitle || '';
                document.proposals[index].description = newDescription || '--';
                document.proposals[index].purpose = newPurpose || '--';
                document.proposals[index].proposer = newProposer || '--';
            } else {
                document.proposals.splice(index, 1);
            }
        }
        document.markModified('proposals');
        await document.save();
        try {
            const message = await (interaction.channel as TextChannel).messages
                .fetch(document.message.messageId);
            await message.edit(referendum.getMessage());
        } catch (e) { }
    } else
        interaction.followUp({ ephemeral: true, content: 'data not found' });
};

export = SubmitProposal;