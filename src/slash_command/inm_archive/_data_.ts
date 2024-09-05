import { SlashCommandBuilder } from "discord.js";

export = new SlashCommandBuilder()
    .setName('inm_archive')
    .setNameLocalization("zh-TW", "淫夢檔案")
    .setDescription('Inm Archive')
    .addSubcommand(command => command
        .setName('feed')
        .setNameLocalization("zh-TW", '餵食')
        .setDescription('choose an image')
        .addStringOption(option => option
            .setName('image')
            .setDescription('type and choose')
            .setRequired(true)
            .setAutocomplete(true))
        .addStringOption(option => option
            .setName('category')
            .setDescription('test')
            .setAutocomplete(true)
        )
    )
    .addSubcommand(command => command
        .setName('taste')
        .setNameLocalization("zh-TW", '品鑑')
        .setDescription('see other ppl\'s remake (random)')
    )
    .addSubcommand(command => command
        .setName('register')
        .setDescription('register')
    )
    .addSubcommandGroup(group => group
        .setName('upload')
        .setNameLocalization("zh-TW", '上傳')
        .setDescription('upload media for further use')
        .addSubcommand(command => command
            .setName('image')
            .setDescription('upload raw material for further use')
            .addStringOption(option => option
                .setName('name')
                .setDescription('the name of this image')
                .setRequired(true)
                .setMaxLength(100)
            )
            .addAttachmentOption(option => option
                .setName('content')
                .setDescription('only adapt images currently')
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('text')
            .setDescription('a quote or paragraph etc.')
            .addStringOption(option => option
                .setName('name')
                .setDescription('the name of this image')
                .setRequired(true)
                .setMaxLength(100)
            )
            .addStringOption(option => option
                .setName('content')
                .setDescription('any text content')
                .setRequired(true)
                .setMaxLength(3000)
            )
        )
    )