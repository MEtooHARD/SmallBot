import { ApplicationCommandType, ChatInputCommandInteraction, GuildMember, InteractionContextType, MessageComponentInteraction, PartialGroupDMChannel, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { SlashCommand, CommandExecutor } from "../../classes/Command";
import { doAfterSec } from "../../functions/general/delay";
import { atUser } from "../../functions/discord/mention";
import Bomber from "../../classes/Bomber";
import ButtonRow from "../../classes/ActionRow/ButtonRow";

export class bomb extends SlashCommand {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('bomb')
        .setDescription('Bomb someone')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('target')
            .setDescription('The person you want to bomb.')
            .setRequired(true))
        .addNumberOption(option => option
            .setName('count')
            .setDescription('How many times you want to be hate. *wink')
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(true))
        .addNumberOption(option => option
            .setName('period')
            .setDescription('The period of each bomb.')
            .setMinValue(2)
            .setMaxValue(15));

    executor: CommandExecutor<ApplicationCommandType.ChatInput> = async (interaction: ChatInputCommandInteraction) => {
        const target = interaction.options.getMember('target');
        const count = Number(interaction.options.getNumber('count'));
        const period = Number(interaction.options.getNumber('period')) || 5;
        if (isNaN(count) || !(target instanceof GuildMember) || !target) {
            interaction.reply({
                flags: 'Ephemeral',
                content: 'Some eror occured. pls contact my owner.'
            })
        } else {
            if (target.user.bot && interaction.member)
                // target = interaction.member;
                doAfterSec(() => {
                    if (interaction.channel && !(interaction.channel instanceof PartialGroupDMChannel))
                        interaction.channel.send(`${atUser(interaction.user)} 還想炸bot啊`);
                }, 8);

            const bomb = new Bomber({
                channel: interaction.channel,
                target: target.user.bot ? interaction.member : target,
                count: Math.round(count),
                period: period
            })
            const reply = await interaction.reply({
                content: 'Bombing...',
                components: [
                    new ButtonRow([
                        bomb.imHere()
                    ])
                ],
                fetchReply: true
            });

            const filter = (interaction: MessageComponentInteraction): boolean => {
                return interaction.user.id === target.id
            }

            const collector = reply.createMessageComponentCollector({ filter: filter, time: (count * period + 1) * 1000, max: 1 });

            collector.on('collect', (i: MessageComponentInteraction) => {
                collector.emit('end');
            })

            collector.on('end', (collected, reason: string) => {
                bomb.stop();
                try {
                    reply.edit({
                        content: 'We strongly condemn ' + atUser(interaction.user.id),
                        components: []
                    })
                } catch (e) { }
            })

            collector.on('ignore', (i: MessageComponentInteraction) => {
                i.reply({
                    flags: 'Ephemeral',
                    content: 'You\'re not @' + target.user.username
                })
            })

            bomb.bomb();
        }
    }
};
