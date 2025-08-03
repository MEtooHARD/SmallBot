import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/Command";


export class LLM extends SlashCommand {
    data = new SlashCommandBuilder()
        .setName('llm')
        .setDescription('start chatting with LLM');
    async executor(interaction: ChatInputCommandInteraction<CacheType>) {

    }
}