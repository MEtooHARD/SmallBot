import { ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/Command";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('inm_archive')
        .setNameLocalization("zh-TW", "淫夢檔案")
        .setDescription('Inm Archive')
        .addSubcommand(command => command
            .setName('send')
            .setNameLocalization("zh-TW", '傳送')
            .setDescription('choose an image (and quotes or custom words)')
            .addStringOption(option => option
                .setName('image')
                .setDescription('type and choose')
                .setRequired(true)
                .setAutocomplete(true))
        )
        .addSubcommand(command => command
            .setName('appreciate')
            .setNameLocalization("zh-TW", '鑑賞')
            .setDescription('see other ppl\'s remake (random)')
        )
        .addSubcommand(command => command
            .setName('upload')
            .setNameLocalization("zh-TW", '上傳')
            .setDescription('upload an image and/or a quote')
            // .addAttachmentOption(option => option
            //     .setName('image')
            //     .setDescription('image')
            // )
            // .addStringOption(option => option
            //     .setName('quote')
            //     .setDescription('quote')
            // )
        )
    ,

    executor: async function (interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'appreciate':
                break;
            case 'send':
                break;
            case 'upload':
                break;
            // console.log(subcommand)
        }
    },

    permissions: [
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ViewChannel
    ]
});