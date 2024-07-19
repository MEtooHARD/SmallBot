import { ButtonInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { Referendum } from "../../classes/Referendum";

const forward = async (interaction: ButtonInteraction, svcInfo: string[]) => {
    const document = await ReferendumModel.findById(svcInfo[2]);
    if (document) {
        await interaction.message.delete();
        await interaction.channel?.send(new Referendum(document).getMessage());
    }
}

export = forward;