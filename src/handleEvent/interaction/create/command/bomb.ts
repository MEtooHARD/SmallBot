import { ChatInputCommandInteraction, GuildMember, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";
import Bomber from "../../../../classes/Bomber";
import { atUser } from "../../../../functions/discord/mention";
import ButtonRow from "../../../../classes/ActionRow/ButtonRow";
import { doAfterSec } from "../../../../functions/general/delay";

export = new class explode extends Command {

    data = new SlashCommandBuilder()
        .setName('bomb')
        .setDescription('Bomb someone')
        .setDMPermission(false)
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
            .setMaxValue(15))

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const target = interaction.options.getMember('target');
        const count = Number(interaction.options.getNumber('count'));
        const period = Number(interaction.options.getNumber('period')) || 5;
        if (isNaN(count) || !(target instanceof GuildMember) || !target) {
            interaction.reply({
                ephemeral: true,
                content: 'Some eror occured. pls contact my owner.'
            })
        } else if (target.user.bot) {
            interaction.reply(`你他媽想炸${atUser(target)}啊?`);
            doAfterSec(() => {
                if (interaction.channel)
                    interaction.channel.send(`${atUser(interaction.user)}根本笑死`);
            }, 5);
        } else {
            const bomb = new Bomber({
                channel: interaction.channel,
                target: target,
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

            const collector = reply.createMessageComponentCollector({ filter: filter, time: count * period * 1000, max: 1 });

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
                    ephemeral: true,
                    content: 'You\'re not @' + target.user.username
                })
            })

            bomb.bomb();
        }
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}