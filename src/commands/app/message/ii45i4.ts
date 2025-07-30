import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    InteractionContextType,
    ApplicationIntegrationType,
    PermissionFlagsBits
} from "discord.js";
import { CommandExecutor, MessageContextMenuCommand, MessageContextMenuValidator } from "../../../classes/Command";
import { Result_ } from "../../../classes/Basic/GeneralTypes";
import homo from "../../../functions/general/homo";
import { sendDebugMessage } from "../../../events/other/unknowError";
import { randomPick } from "../../../functions/general/array";


export class ii45i4_mc extends MessageContextMenuCommand {
    activated: Readonly<boolean> = true;

    requiredPerms: bigint[] = [PermissionFlagsBits.SendMessages];

    data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
        .setName('114514')
        .setType(ApplicationCommandType.Message)
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        )
        .setIntegrationTypes(
            ApplicationIntegrationType.UserInstall,
            ApplicationIntegrationType.GuildInstall
        );

    validator: MessageContextMenuValidator = (interaction): Result_<string, string> => {
        // const hasImage = interaction.targetMessage.attachments
        //     .filter(_ => _.contentType && supported.includes(_.contentType))
        //     .size > 0;
        const hasNum = /\d/.test(interaction.targetMessage.content);

        return [/* hasImage || */ hasNum, "Message does not contain any number in texts or supported image.\n(image detection is not available now)"];
    };

    executor: CommandExecutor<ApplicationCommandType.Message> = async (interaction) => {
        // const defer = interaction.deferReply();

        // const worker = await createWorker(['eng', 'osd'],
        //     OEM.TESSERACT_ONLY,
        //     {});

        const content_numbers: string[] =
            interaction.targetMessage.content
                .match(/\d+/gm) as RegExpMatchArray || [];

        // const valid_images =
        //     interaction.targetMessage.attachments
        //         .filter(attachment => supported
        //             .includes(attachment.contentType as string))
        //         .map(attachment => attachment.url);
        // const image = randomPick(valid_images)[0];
        // let image_numbers: string[] = [];
        // if (image) {
        //     const result = await worker.recognize(image, {}, { blocks: true });

        //     image_numbers =
        //         result.data.blocks?.map(
        //             block => block.paragraphs.map(
        //                 paragraph => paragraph.lines.map(
        //                     line => line.words
        //                         .filter(word => word.confidence > 20 && /\d/.test(word.text))
        //                         .map(word => word.text.match(/\d+/g) as RegExpMatchArray)
        //                         .flat()
        //                 ).flat()
        //             ).flat()
        //         ).flat()
        //         || [];

        //     // console.log(image_numbers);
        //     // console.log(content_numbers);
        // }

        // await defer;

        const collection = content_numbers /* content_numbers.concat(image_numbers) */;
        if (collection.length > 0) {
            const theOneChosenShit = randomPick(collection)[0];
            const result = homo(Number(theOneChosenShit));

            try {
                await interaction.reply(`${theOneChosenShit} = \`${result}\``);
            } catch (e) {
                sendDebugMessage(e, 'unhandledRejection')
            }
        } else {
            try {
                await interaction.editReply("Couldn't recognize any number.");
            } catch (e) {
                sendDebugMessage(e, 'unhandledRejection');
            }
        }
    };
}
