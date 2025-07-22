import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, ComponentType, ButtonStyle, TextChannel } from "discord.js";
import { ChatInputValidator, SlashCommand } from "../../classes/Command";
import { Result_ } from "../../classes/Basic/GeneralTypes";
import { Question } from "../../classes/ResponseCollector";
import { delaySec } from "../../functions/general/delay";
import axios from "axios";

export class test extends SlashCommand {
    activated = true;

    guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM
        )
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('.')
        )
        ;

    validator: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result_<string, string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();
        const image = interaction.options.getAttachment('image');
        if (image) {
            const { data: imageArrayBuffer } = await axios.get(
                image.url,
                { responseType: 'arraybuffer' }
            )
            const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
            interaction.followUp(imageBase64);
        } else {
            interaction.followUp('fa');
        }
    }
}
