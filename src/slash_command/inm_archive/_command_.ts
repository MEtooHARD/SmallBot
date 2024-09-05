import { ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Command } from "../../classes/Command";
import data from './_data_';
import { Material_Content_Type, solveImage, solveText } from "./upload";
import { handleRegister } from "./register";
import { handleFeed } from "./feed";
import { InmArchive } from "../../classes/InmArchive/InmArchive";
import { autocomplete } from "./_autocomplete_";

export = new Command<ApplicationCommandType.ChatInput>({
    data: data,
    complete: autocomplete,

    executor: async function (interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const subgroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subgroup === 'upload') {
            const name = interaction.options.getString('name', true);

            let material: Material_Content_Type;

            if (subcommand === 'image')
                material = solveImage(interaction);
            else
                material = solveText(interaction);

            await interaction.editReply
                (`name: ${name}\ntype: ${material.type}\ncontent: ${material.content}`);

            if (subcommand === 'image'
                && !InmArchive.isListedMIMEType(material.type)) {
                interaction.followUp({
                    ephemeral: true,
                    content: InmArchive.InvalidMIMETypesString
                })
            } else {
                const success = await InmArchive.Material.upload({
                    content: material.content,
                    name: name,
                    type: material.type,
                    uploader: interaction.user.id
                })
                interaction.followUp({
                    ephemeral: true,
                    content: `${success ? 'Succeed' : 'Failed'} to save material`
                });
            }
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