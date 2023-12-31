import { APIInteractionDataResolvedGuildMember, CacheType, ChatInputCommandInteraction, CommandInteractionOption, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextBasedChannel, User, time } from "discord.js";
import Command from "../../../../classes/Command";
import { range } from "../../../../functions/array/number";
import { doAfterSec } from "../../../../functions/async/delay";

const trigger = async (channel: TextBasedChannel | null, target: GuildMember | APIInteractionDataResolvedGuildMember | null, frequency: number): Promise<void> => {
    if (target instanceof GuildMember)
        range({ start: 1, end: frequency }).forEach(async x => {
            await doAfterSec(async () => await channel?.send(`<@${target?.id}>`), x * 5);
        })
}

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
            .setMaxValue(10)
            .setRequired(true))

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const target = interaction.options.getMember('target');
        const frequency = interaction.options.getNumber('frequency');
        interaction.reply({
            // ephemeral: true,
            content: 'Bombing...'
        });
        trigger(interaction.channel, target, Math.round(Number(frequency)));
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
        // return Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
    }
}