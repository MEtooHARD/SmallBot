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
        if (svcInfo[2] === '+') {
            document.proposals.push({
                title: newTitle,
                description: newDescription,
                purpose: newPurpose,
                proposer: newProposer,
                uploader: interaction.user.id,
                advocates: 0,
                opponents: 0
            });
        } else {
            if (document.proposals.length <= Number(svcInfo[2])) {
                await interaction.followUp({ ephemeral: true, content: 'something went wrong. try again' });
            } else {
                document.proposals[Number(svcInfo[2])].title = newTitle;
                document.proposals[Number(svcInfo[2])].description = newDescription;
                document.proposals[Number(svcInfo[2])].purpose = newPurpose;
                document.proposals[Number(svcInfo[2])].proposer = newProposer;
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