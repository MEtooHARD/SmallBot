import { ApplicationCommandType, ApplicationIntegrationType, CacheType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction } from "discord.js";
import { suppress, tryCatch, tryCatch_flat } from "../../../classes/Basic/GeneralTypes";
import { MessageContextMenuCommand } from "../../../classes/Command";
// import { GrokSupportedMessageParam } from "../../../classes/LLM/types";
// import { GrokModels } from "../../../classes/LLM/Wrapper";
import config from '../../../config.json';


export class Roast_This extends MessageContextMenuCommand {
    data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
        .setName('Roast This')
        .setContexts(InteractionContextType.Guild)
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)

    async executor(interaction: MessageContextMenuCommandInteraction<CacheType>): Promise<void> {
        if (!interaction.channel || !interaction.channel.isDMBased()
            && !interaction.channel.permissionsFor(interaction.client.user)?.has('SendMessages')) {
            suppress(interaction.reply('i cannot view or send messages here'));
            return;
        };
        const [_, err] = await tryCatch(interaction.deferReply());
        if (err) return;

        const message = interaction.targetMessage;
        const content = message.content;
        const images = Array.from(message.attachments.filter(
            attachment => attachment.contentType && attachment.contentType.startsWith('image/')
        ).values());

        const name = message.member?.nickname || message.author.displayName;
        const avatarUrl = message.member?.avatarURL() || message.author.avatarURL();

        // const params: GrokSupportedMessageParam[] = [
        //     {
        //         role: 'system',
        //         content: 'Succinctly, but not too shortly, roast the user, their words or images.'
        //     },
        //     {
        //         role: 'system',
        //         content: 'The target user\'s info: name: ' + name
        //             + ', avatar: ' + avatarUrl
        //             + '\nUsers may also use this on your messages, your info here: name: '
        //             + message.client.user.displayName
        //             + '\nPreferred locale: ' + (message.guild?.preferredLocale || 'en-US')
        //     }
        // ];

        // if (message.content.length > 0)
        //     params.push({
        //         role: 'user',
        //         name: 'the target user\'s words',
        //         content: content,
        //     });

        // if (images.length > 0)
        //     params.push({
        //         role: 'user',
        //         name: 'the target user\'s images',
        //         content: images.map(image => image.url).join('\n')
        //     });

        try {
            // const [res, err] = await tryCatch_flat(GrokModels.Grok_4_0709.post(
            //     config.models.grok.keys[0], {
            //     messages: params
            // }))

            // if (!res?.choices[0].message.content)
            //     throw new Error('no model response');
            // await interaction.editReply({ content: res.choices[0].message.content });
        } catch (e) {
            suppress(interaction.editReply({ content: 'Roast failed. ' + (e as Error).message }));
        }
    }

}