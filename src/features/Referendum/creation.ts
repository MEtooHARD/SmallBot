import { ModalSubmitInteraction, Snowflake } from "discord.js";
import { ReferendumModel } from "../../models/ReferendumModel";
import { ReferendumModalFieldsCustomID, UserInfo } from "../../classes/Referendum";
import { ActivityStage } from "../../classes/Activity";

const creation = async (interaction: ModalSubmitInteraction<'cached'>, svcInfo: string[]) => {
    const reply = await interaction.reply({
        ephemeral: true,
        embeds: [{ description: 'Recieved.' }]
    });

    let title = interaction.fields.getTextInputValue(ReferendumModalFieldsCustomID.TITLE);
    let description = interaction.fields.getTextInputValue(ReferendumModalFieldsCustomID.DESCRIPTION);
    let startTime: number;
    let endTime: number;
    let stage: ActivityStage;
    const createdBy: UserInfo = { id: interaction.user.id, username: interaction.user.username, displayname: interaction.user.displayName };
    let entitled: Snowflake[] = [];



    // const referendumModel = new ReferendumModel({
    //     title: ,
    //     proposals: [],
    //     guilds: [],
    //     users: [],
    //     description: ,
    //     startTime: 4,
    //     createdBy: interaction.user.id,
    //     createdIn: interaction.guild.id,
    // });
};

export = creation;