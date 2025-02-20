import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, ComponentType, ButtonStyle } from "discord.js";
import { ChatInputValidator, SlashCommand } from "../../classes/Command";
import { Result } from "../../classes/GeneralTypes";
import { Question } from "../../classes/ResponseCollector";

export class test extends SlashCommand {
    activated = true;

    guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM
        );

    validator: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result<string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
        const question = new Question({
            title: 'test q',
            description: 'test d',
            options: [
                [
                    { label: 'dsadasdasd', customId: 'test', style: ButtonStyle.Primary },
                    { label: 'dasdasd', customId: 'tes', style: ButtonStyle.Primary }
                ],
                [
                    { label: 'asd', customId: 'USADASDAs', style: ButtonStyle.Primary },
                    { label: 'dasfadfasd', customId: 'ttes', style: ButtonStyle.Primary }
                ]
            ],
            collectorData: {
                max: 1,
                componentType: ComponentType.Button,
                filter: (i) => i.user.id === interaction.user.id,
                idle: 20 * 1000
            }
        })

        const response = await interaction.reply(question.getMessageOptions());

        // question.onResponse(response, () => {
        //     console.log(question.answer);
        // });
    }
}
