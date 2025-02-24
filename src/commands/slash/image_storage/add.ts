import { AttachmentBuilder, Colors } from "discord.js";
import { ChatInputExecutor } from "../../../classes/Command";
import { MediaStorage } from "../../../classes/ImageStorage";

export const add: ChatInputExecutor = async (interaction) => {
    const guildId = interaction.guildId as string;
    const group = interaction.options.getString('group', true).trim();
    const name = interaction.options.getString('name', true).trim();
    const image = interaction.options.getAttachment('image', true);

    const defer = interaction.deferReply();

    const { data, error } = await MediaStorage.getImage(guildId, group, name);

    await defer;
    if (data) {
        await interaction.editReply('Image with same name and group already exists.');
    } else if (error) {
        const reply = await interaction.editReply({
            embeds: [{
                color: Colors.Yellow,
                description: "Don't delete this message or the media will disappear."
                    + "\nYou're responsible for the content."
            }],
            files: [new AttachmentBuilder(image.url, { name: name + image.contentType?.replace('image/', '.') })]
        });

        const permanentUrl = reply.attachments.first()?.url as string;

        const { error } = await MediaStorage.addImage({
            guild_id: guildId,
            name: name,
            group: group,
            url: permanentUrl
        });

        if (error) {
            await interaction.followUp('Upload failed.');
        } else {
            await interaction.followUp({
                embeds: [MediaStorage.imageDisplay(name, group, permanentUrl)]
            });
        }
    }
}