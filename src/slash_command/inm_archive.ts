import { ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import data from './inm_archive/data';
import { Material_Content_Type, solveImage, solveText } from "./inm_archive/upload";
import { handleRegister } from "./inm_archive/register";
import { handleFeed } from "./inm_archive/feed";
import { InmArc } from "..";

export = new Command<ApplicationCommandType.ChatInput>({
    data: data,

    executor: async function (interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const subgroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subgroup === 'upload') {
            const name = interaction.options.getString('name', true);
            let material: Material_Content_Type;
            if (subcommand === 'image')
                material = solveText(interaction);
            else
                material = solveImage(interaction);

            await interaction.editReply
                (`name: ${name}\ntype: ${material.type}\ncontent: ${material.content}`);

            const success = await InmArc.upload({
                content: material.content,
                name: name,
                type: material.type,
                uploader: interaction.user.id
            })
            interaction.followUp({
                ephemeral: true,
                content: `${success ? 'Succeed' : 'Failed'} to save material`
            });
        } else
            if (subcommand === 'register')
                handleRegister(interaction);
            else if (subcommand === 'taste') { }
            else if (subcommand === 'feed') {
                handleFeed(interaction);
            }
    },

    botPermissions: [
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ViewChannel
    ]
});