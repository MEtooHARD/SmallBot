import { ChatInputExecutor } from "../../../classes/Command";
import { ImageStorage } from "../../../classes/ImageStorage";

export const get: ChatInputExecutor = async (interaction) => {
    const guildId = interaction.guildId as string;
    const group = interaction.options.getString('group', true).trim();
    const name = interaction.options.getString('name', true).trim();
    const ephemeral = Boolean(interaction.options.getBoolean('peek'));

    const defer = ephemeral
        ? interaction.deferReply({ flags: 'Ephemeral' })
        : interaction.deferReply();

    const { data: url, error } = await ImageStorage.getImageUrl(guildId, group, name);

    await defer;

    if (url) {
        await interaction.editReply(url);
    } else {
        console.error(error);
        await interaction.editReply({
            content: 'Image not found.'
        });
    }
}