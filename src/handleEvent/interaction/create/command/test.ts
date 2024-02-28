import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandFilterOptionType, Command } from "../../../../classes/Command";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDefaultMemberPermissions(0)
        .setDMPermission(true)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        interaction.reply({
            ephemeral: true,
            content: 'recieved'
        })
        const UID = interaction.user.id;
        const DM = await interaction.user.createDM();
        DM.send('your UID: ' + UID);
    }

    filter(interaction: CommandFilterOptionType): boolean {
        return true;
    }
}