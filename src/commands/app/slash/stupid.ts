import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder, User } from "discord.js";
import fs from 'node:fs';
import { SlashCommand } from "../../../classes/Command";
import { atUser } from "../../../functions/discord/mention";
import { picPath } from "../../../functions/general/path";

const items: string[] = [
    'God\'s Hands'
];

export class stink extends SlashCommand {
    override activated = true;

    data = new SlashCommandBuilder()
        .setName('stink')
        .setDescription('1145141919810')
        .addStringOption(option => option
            .setName('item')
            .setDescription('Stinky Thingy')
            .setChoices(...items.map(x => { return { name: x, value: x, } }))
            .setRequired(true))
        .setContexts(InteractionContextType.Guild);

    executor = async (interaction: ChatInputCommandInteraction) => {
        interaction.reply({
            files: [{
                attachment: fs.readFileSync(picPath('114514.webp'))
            }]
        });
    }
}


export class please extends SlashCommand {
    override activated = true;

    data = new SlashCommandBuilder()
        .setName('please')
        .setDescription('Please a person.')
        .addUserOption(option => option
            .setName('target')
            .setDescription("The person you wonna please.")
            .setRequired(true))
        .setContexts(InteractionContextType.Guild);

    executor = async (interaction: ChatInputCommandInteraction) => {
        const target = (interaction.options.getUser('target') as User);
        interaction.reply(atUser(target) + "\n# 🟢 Accepted");
    }
};
