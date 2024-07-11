import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { Button } from "../../../classes/ActionRow/Button";
import { TimeSelector } from "../../../classes/TimeSelector";
import { timestamp } from "../../../functions/discord/mention";
import { Question, ResponseCollector } from "../../../classes/ResponseCollector";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const responsor = new ResponseCollector([
            new Question({
                question: 'are u gae',
                options: [
                    {
                        customId: 'y',
                        style: ButtonStyle.Success,
                        label: 'gaeeeeee'
                    },
                    {
                        customId: 'yyy',
                        style: ButtonStyle.Success,
                        label: 'sure'
                    },
                    {
                        customId: 'yy',
                        style: ButtonStyle.Success,
                        label: 'absolutely'
                    }
                ]
            })
        ]);

        const reply = await interaction.reply({
            embeds: [responsor.header],
            components: responsor.panel,
            ephemeral: true,
            fetchReply: true
        });

        responsor.start(reply, (answer) => {
            responsor.addQuestions([
                new Question({
                    question: 'do you suck',
                    options: [
                        {
                            customId: 's',
                            style: ButtonStyle.Success,
                            label: 'always'
                        },
                        {
                            customId: 'ss',
                            style: ButtonStyle.Success,
                            label: 'yeet'
                        }
                    ]
                })
            ]);
            interaction.channel?.send('from command recieved: ' + (answer.label || answer.emoji));
        });
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}