import { ContextMenuCommandBuilder, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits, AttachmentBuilder } from "discord.js";
import { CommandExecutor, UserContextMenuCommand } from "../../../classes/Command";
import axios from "axios";
import sharp from "sharp";

const AvatarSize = 230;
const WifeMeterSize = 400;

const background = sharp('media/pic/gay_thermometer.png')
    .resize(WifeMeterSize, null);

export class gay extends UserContextMenuCommand {
    data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
        .setName('9ay')
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes(
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        );

    requiredPerms: bigint[] = [
        PermissionFlagsBits.AttachFiles,
    ]

    executor: CommandExecutor<ApplicationCommandType.User> = async (interaction) => {

        await interaction.deferReply();

        try {
            const { data: avatarImageBuffer } = await axios.get(
                interaction.targetUser.displayAvatarURL(),
                { responseType: 'arraybuffer' }
            );

            const roundedCorners = Buffer.from(
                `<svg><rect x="0" y="0" width="${AvatarSize}" height="${AvatarSize}" rx="${AvatarSize / 2}" ry="${AvatarSize / 2}"/></svg>`
            )

            const resizedAvatar = await sharp(avatarImageBuffer)
                .resize(AvatarSize, null)
                .composite([{ input: roundedCorners, blend: 'dest-in' }])
                .toBuffer();

            const outputBuffer = await background
                .composite([{
                    input: resizedAvatar,
                    top: 55, left: 145
                }])
                .toBuffer();

            interaction.editReply({
                files: [
                    new AttachmentBuilder(outputBuffer, { name: 'result.png' })
                ]
            })
        } catch (error) {
            console.error(error);
        }
    };

}