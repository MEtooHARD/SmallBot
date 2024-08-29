import { ChatInputCommandInteraction } from "discord.js";
import { Material } from "../../classes/InmArchive/InmArchive";

export type Material_Content_Type = Pick<Material['Insert'], 'content' | 'type'>;;

export function solveText(
    interaction: ChatInputCommandInteraction
): Material_Content_Type {
    return {
        content: interaction.options.getString('content', true),
        type: 'txt',
    };
};

export function solveImage(
    interaction: ChatInputCommandInteraction,
): Material_Content_Type {
    const attachment = interaction.options.getAttachment('content', true);
    const content = attachment.url;
    const type = attachment.contentType || 'cannot get a type';

    return {
        content: content,
        type: type
    };
};