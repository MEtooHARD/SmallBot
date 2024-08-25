import { ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { InmArchive } from "..";
import { MIMETypes } from "../classes/InmArchive/InmArchive";

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
    ,

    executor: async function (interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const subgroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        switch (subgroup) {
            case 'upload':
                const name = interaction.options.getString('name', true);
                let content: string = '', type: string = '';
                switch (subcommand) {
                    case 'text':
                        content = interaction.options.getString('content', true);
                        type = 'txt';
                        break;
                    case 'image':
                        const attachment = interaction.options.getAttachment('content', true);
                        content = attachment.url;
                        type = attachment.contentType || '';
                        break;
                }
                await interaction.editReply(`name: ${name}\ntype: ${type}\ncontent: ${content}`);
                if (type !== 'txt' && !MIMETypes.includes(type)) {
                    interaction.followUp({
                        ephemeral: true,
                        content: `only accept following MIME types:\n${MIMETypes.join(', ')}`
                    })
                } else {
                    const success = await InmArchive.upload({
                        content: content,
                        name: name,
                        type: type,
                        uploader: interaction.user.id
                    })
                    interaction.followUp({
                        ephemeral: true,
                        content: `${success ? 'Succeed' : 'Failed'} to save material`
                    });
                }
                break;
            default:
                switch (subcommand) {
                    case 'register':
                        let message = '';
                        if (await InmArchive.existsUser(interaction.user.id)) {
                            message = 'You\'ve already been a user of Inm Archive.';
                        } else {
                            if (await InmArchive.addUser(interaction.user.id))
                                message = 'Registeration succeed!';
                            else
                                message = 'Registeration Failed.';
                        }
                        interaction.editReply(message);
                        break;
                    case 'taste':
                        break;
                    case 'send':
                        break;
                }
        }
    },

    permissions: [
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ViewChannel
    ]
});