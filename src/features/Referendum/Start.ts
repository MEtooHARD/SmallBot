import { ButtonInteraction, ButtonStyle, GuildMember } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { ButtonDialog } from "../../classes/ButtonDialog";
import { Referendum } from "../../classes/Referendum";

const Start = async (interaction: ButtonInteraction, svcInfo: string[]) => {
    const document = await ReferendumModel.findById(svcInfo[2]);
    if (document) {
        const referendum = new Referendum(document);
        if (referendum.master(interaction.member as GuildMember)) {
            const dialog = new ButtonDialog({ interaction: interaction });
            try {
                const confirmation = await dialog.awaitResponse({
                    header: {
                        title: 'The Commencement is Irreversible',
                        description: 'Click **Confirm** to continue, or click **Cancel** to cancel.'
                    },
                    options: [{
                        customId: '$confirm',
                        style: ButtonStyle.Success,
                        label: 'Confirm'
                    },
                    {
                        customId: '$cancel',
                        style: ButtonStyle.Secondary,
                        label: 'Cancel'
                    }],
                    ephemeral: true,
                    idle: 20 * 1000
                });
                if (confirmation.customId === '$confirm') {
                    document.stage = Referendum.Stage.ACTIVE;
                    document.startedAt = Date.now();
                    await document.save();
                    await interaction.message.edit(referendum.getMessage());
                }
            } catch (e) { console.log(e); }
        } else {
            interaction.reply({ ephemeral: true, content: 'You are not granted to do this.' })
        }
    } else
        await interaction.reply({ ephemeral: true, content: 'data not found' });
};

export = Start;