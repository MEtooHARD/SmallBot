import { ModalSubmitInteraction } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { ReferendumModalFieldsCustomID } from "../../classes/Referendum";

const creation = async (interaction: ModalSubmitInteraction<'cached'>, svcInfo: string[]) => {
    const reply = await interaction.reply({
        ephemeral: true,
        embeds: [{ description: 'Recieved.' }]
    });

    const referendumModel = new ReferendumModel({
        title: interaction.fields.getTextInputValue(ReferendumModalFieldsCustomID.title),
        proposals: [],
        guilds: [],
        users: [],
        description: interaction.fields.getTextInputValue(ReferendumModalFieldsCustomID.description),
        startTime: Date.now(),
        createdBy: interaction.user.id,
        createdIn: interaction.guild.id,
        // global:
    });
}

export = creation;