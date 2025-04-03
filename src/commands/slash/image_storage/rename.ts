import { ButtonStyle, ChatInputCommandInteraction, Colors, ComponentType } from "discord.js"
import { ChatInputExecutor } from "../../../classes/Command"
import { MediaStorage } from "../../../classes/ImageStorage"
import { Question } from "../../../classes/ResponseCollector"


export const rename: {
    image: ChatInputExecutor
    group: ChatInputExecutor
} = {
    image: async function (interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guildId as string;
        const group = interaction.options.getString('group', true).trim();
        const name = interaction.options.getString('name', true).trim();
        const newGroup = interaction.options.getString('new_group')?.trim() || group;
        const newName = interaction.options.getString('new_name')?.trim() || name;

        const defer = interaction.deferReply();

        const [renamee, target] = await Promise.all([
            MediaStorage.existsImage(guildId, group, name),
            MediaStorage.existsImage(guildId, newGroup, newName)
        ]);

        const response = await defer;
        if (!renamee.data) {
            interaction.editReply(`The image to rename doesn't exist.`);
        } else if (target.data) {
            interaction.editReply(`Renamee destination already exists.`);
        } else if (renamee.error || target.error) {
            console.error(renamee.error);
            console.error(target.error);
            interaction.editReply(`Couldn\'t validate image.`);
        } else {
            const question = new Question({
                title: 'Are you sure to rename this image?',
                description: `Name:\n${name} -> ${newName}\n\nGroup:\n${group} -> ${newGroup}`,
                options: [[
                    { label: 'Yes', customId: 'Yes', style: ButtonStyle.Success },
                    { label: 'No', customId: 'No', style: ButtonStyle.Danger }
                ]],
                collectorData: {
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 20_000,
                    max: 1,
                    componentType: ComponentType.Button
                }
            });

            await interaction.editReply(question.getMessageOptions());

            try {
                const answers = await question.onResponse(response);

                if (answers[0].customId === 'No') {
                    interaction.followUp(`Rename cancelled.`);
                    return;
                }

                const { data: image, error: update_error } = await MediaStorage.updateImage(guildId, group, name, newGroup, newName);

                if (update_error) {
                    console.error(update_error);
                    interaction.followUp(`Rename failed.`);
                    return;
                }

                interaction.followUp({
                    embeds: [{
                        color: Colors.Green,
                        title: 'Image Renamed',
                        description: `Name:\n${name} -> ${newName}\n\nGroup:\n${group} -> ${newGroup}`,
                        image: { url: image.url }
                    }]
                })
            } catch (e) {
                console.error(e);
                interaction.followUp(`Rename failed. No response: ${e}`);
            }
        }
    },

    group: async function (interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guildId as string;
        const group = interaction.options.getString('group', true).trim();
        const newGroup = interaction.options.getString('new_group', true).trim();

        const defer = interaction.deferReply();

        const [exists_group, image_count, exists_newGroup] = await Promise.all([
            MediaStorage.existsGroup(guildId, group),
            MediaStorage.getImageCountOfGroup(guildId, group),
            MediaStorage.existsGroup(guildId, newGroup)
        ]);

        const response = await defer;
        if (exists_group.error || image_count.error) {
            console.error(exists_group.error);
            console.error(image_count.error);
            interaction.editReply(`Couldn\'t validate group.`);
            return;
        }

        const question = new Question({
            title: 'Are you sure to rename this group?',
            description: `Group:\n${group} -> ${newGroup}`
                + `\n\nImages of ${group}: \`${image_count.data}\``
                + `\n\nNew group ${newGroup} ${exists_group.data
                    ? 'already exists' : 'is safe to use'}.`,
            options: [[
                { label: 'Yes', customId: 'Yes', style: ButtonStyle.Success },
                { label: 'No', customId: 'No', style: ButtonStyle.Danger }
            ]],
            collectorData: {
                filter: (i) => i.user.id === interaction.user.id,
                time: 20_000,
                max: 1,
                componentType: ComponentType.Button
            }
        });

        await interaction.editReply(question.getMessageOptions());

        try {
            const answers = await question.onResponse(response);

            if (answers[0].customId === 'No') {
                interaction.followUp(`Rename cancelled.`);
                return;
            }

            const update_result = await MediaStorage.updateGroup(guildId, group, newGroup);

            if (update_result.error) {
                console.error(update_result.error);
                interaction.followUp(`Rename failed.`);
                return;
            }

            interaction.followUp({
                embeds: [{
                    color: Colors.Green,
                    title: 'Group Renamed',
                    description: `Group:\n${group} -> ${newGroup}\n\nItems effected: \`${update_result.data}\``
                }]
            })
        } catch (e) {
            console.error(e);
            interaction.followUp(`Rename failed. No response: ${e}`);
        }
    }
}