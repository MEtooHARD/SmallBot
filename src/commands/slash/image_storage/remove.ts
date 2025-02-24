import { Colors } from "discord.js";
import { ChatInputExecutor } from "../../../classes/Command";
import { MediaStorage } from "../../../classes/ImageStorage";

export const remove: ChatInputExecutor = async (interaction) => {
    const guildId = interaction.guildId as string;
    const group = interaction.options.getString('group', true).trim();
    const name = interaction.options.getString('name', true).trim();

    const defer = interaction.deferReply();

    const { error, data } = await MediaStorage.removeImage(guildId, group, name);

    await defer;
    if (data) {
        await interaction.editReply({
            embeds: [{
                color: Colors.Green,
                description: 'Removed.'
            },
            MediaStorage.imageDisplay(data.name, data.group, data.url)]
        });
    } else {
        await interaction.editReply({
            embeds: [{
                color: Colors.Yellow,
                description: "Image not found."
            }]
        });
    }
}