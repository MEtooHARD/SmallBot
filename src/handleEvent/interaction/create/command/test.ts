import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";
import test from "../../../../classes/Test";
import { get } from "../../../../test";
import test2 from "../../../../test2";

export = new class explode extends Command {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // test.emit('gg');
        test2();
        console.log(get());
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}