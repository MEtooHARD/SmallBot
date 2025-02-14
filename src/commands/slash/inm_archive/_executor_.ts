import { ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { handleRegister } from "./register";
import { handleFeed } from "./feed";
import { Material_Content_Type, solveImage, solveText } from "./upload";
import { Material } from "../../../classes/InmArchive/Material";
import { InmArchive } from "../../../classes/InmArchive/InmArchive";
import { CommandExecutor } from "../../../classes/Command";

const _executor_/* : CommandExecutor<ApplicationCommandType.ChatInput> */ = async (interaction: ChatInputCommandInteraction) => {
    const subgroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    if (subgroup === 'upload') {
        try {
            const name = interaction.options.getString('name', true);
            let { content, type }: Material_Content_Type =
                subcommand === 'image' ? solveImage(interaction) : solveText(interaction);

            /* ivalid MIME type */
            if (subcommand === 'image' && !InmArchive.MIMETypes.has(type)) {
                interaction.reply({ flags: 'Ephemeral', content: InmArchive.InvalidMIMETypesString });
                return;
            }
            /* overview */
            /* const overviewmsg =  */await interaction.reply({
                /* ephemeral: true, */
                embeds: [
                    Material.OverviewCard({
                        name: name,
                        type: type,
                        content: content
                    })],
                fetchReply: true
            });
            /* get permanent attachment url */
            if (subcommand === 'image') {
                const image = (await interaction.followUp({
                    fetchReply: true, /* ephemeral: true, */
                    files: [{ attachment: content }]
                })).attachments.at(0);
                if (image === undefined)
                    throw 'upload image failed';
                else
                    content = image.url;
            }
            /* insert */
            const success = await InmArchive.Material.upload({
                content: content,
                name: name,
                type: type,
                uploader: interaction.user.id
            });
            /* final */
            if (success) interaction.followUp({ /* ephemeral: true, */ content: 'Succeed!' });
            else throw 'upload failed';

        } catch (e) {
            interaction.followUp({ flags: 'Ephemeral', content: 'process failed.' });
        }
    } else
        if (subcommand === 'register')
            handleRegister(interaction);
        else if (subcommand === 'taste') { }
        else if (subcommand === 'feed') {
            handleFeed(interaction);
        }
};

export default _executor_;