import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import { TrackChess } from "../../../classes/TrackChess";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('track_chess')
        .setDescription('Start a Track Chess.')
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let a = new TrackChess(4);
        interaction.channel?.send({ embeds: [a.embed] });
    }

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}