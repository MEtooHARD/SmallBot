import { ChatInputCommandInteraction, GuildMember, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";
import Bomber from "../../../../classes/Bomber";
import { atUser } from "../../../../functions/discord/text";
import ButtonRow from "../../../../classes/ActionRow/ButtonRow";

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
            .setName('frequency')
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
        const frequency = Number(interaction.options.getNumber('frequency'));
        const period = Number(interaction.options.getNumber('period')) || 5;
        if (isNaN(frequency) || !(target instanceof GuildMember) || !target) {
            interaction.reply({
                ephemeral: true,
                content: 'Some eror occured. pls contact my owner.'
            })
        } else {
            const bomb = new Bomber({
                channel: interaction.channel,
                target: target,
                frequency: Math.round(frequency),
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

            const collector = reply.createMessageComponentCollector({ filter: filter, time: frequency * period * 1000, max: 1 });

            collector.on('collect', (i: MessageComponentInteraction) => {
                bomb.stop();
                i.update({
                    content: 'We strongly condemn ' + atUser(interaction.user.id),
                    components: []
                })
            })

            collector.on('end', (collected, reason: string) => {
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
        // return Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
    }
}