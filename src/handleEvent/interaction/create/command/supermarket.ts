import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";
import { atUser } from "../../../../functions/discord/text";

export = new class explode extends Command {
    data = new SlashCommandBuilder()
        .setName('supermarket')
        .setDescription('supermarket someone.')
        .addUserOption(option => option
            .setName('loli')
            .setDescription('the poor.')
            .setRequired(true))
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const loli = interaction.options.getUser('loli');
        if (loli)
            interaction.reply({
                content: `${atUser(loli)}有人想要超市你`,
            })
        else
            interaction.reply({
                ephemeral: true,
                content: 'something went weong. please contact my owner.'
            })
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}