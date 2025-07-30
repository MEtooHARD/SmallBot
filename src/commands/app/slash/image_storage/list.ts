import { Colors } from "discord.js";
import { ChatInputExecutor } from "../../../../classes/Command";
import { MediaStorage } from "../../../../classes/ImageStorage";


export const list: ChatInputExecutor = async (interaction) => {
    const guildId = interaction.guildId as string;
    const group = interaction.options.getString('group', true);

    const defer = interaction.deferReply();

    // const { data, error } = await ImageStorage.getImages(guildId, group);

    // await defer;

    // if (data) {
    //     await interaction.editReply({
    //         embeds: [{
    //             color: Colors.Blue,
    //             author: { name: 'Image of:' },
    //             title: group,
    //             description: `${data.map(img => ``)}`
    //         }]
    //     });
    // } else {
    //     console.error(error);
    //     await interaction.editReply({
    //         content: 'No images found.'
    //     });
    // }
}