import { ButtonStyle, ChatInputCommandInteraction, Colors, SlashCommandBuilder } from "discord.js";
import { tryCatch } from "../../../classes/Basic/GeneralTypes";
import { SlashCommand } from "../../../classes/Command";
import { Question } from "../../../classes/ResponseCollector";
import { ZhuyinPhrase } from "../../../classes/ZhuyinPhrase";


export class zhuyin_phrases extends SlashCommand {
    data = new SlashCommandBuilder()
        .setName('zhuyinphrases')
        .setDescription('mfkrs')
        .addNumberOption(op => op
            .setRequired(true)
            .setName('length')
            .setDescription('The length')
            .setChoices(
                { name: '2', value: 2 },
                { name: '3', value: 3 },
                { name: '4', value: 4 },
                { name: '5', value: 5 }
            )
        )
        .addNumberOption(op => op
            .setName('time_limit')
            .setDescription('default 1 hr')
            .setChoices(
                { name: '10 min', value: 600_000 },
                { name: '30 min', value: 1800_000 },
                { name: '1 hr', value: 3600_000 },
                { name: '2 hr', value: 7200_000 },
                { name: '5 hr', value: 18000_000 },
                { name: '10 hr', value: 36000_000 },
                { name: '24 hr', value: 86400_000 }
            )
        );

    executor = async (interaction: ChatInputCommandInteraction) => {
        if (ZhuyinPhrase.existsGame(interaction.channelId)
            || await (async () => {
                const question = new Question({
                    title: "There can be only one game at a time!",
                    description: "There's already one running in this channel.",
                    color: Colors.Yellow,
                    options: [[
                        { label: 'Overwrite', customId: 'Y', style: ButtonStyle.Primary },
                        { label: 'Cancel', customId: 'N', style: ButtonStyle.Secondary }
                    ]],
                    collectorData: { max: 1, time: 60_000 }
                })
                const response = await interaction.reply(question.getMessageOptions());
                const [res, ans] = await tryCatch(question.onResponse(response));
                // return res && ans[0].customId === 'Y';
            })()
        ) {

        }
    };
}

