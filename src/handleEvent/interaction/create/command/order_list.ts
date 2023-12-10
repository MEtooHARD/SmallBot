// import path from 'node:path';
// import fs from 'node:fs';
import { CommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';

export = {
    data: new SlashCommandBuilder()
        .setName('order_list')
        .setDescription('Start an order list.')
        .addStringOption(option => option
            .setName('name')
            .setDescription('The shop\'s name for this order list(one or more).')
            .setMaxLength(30))
    ,
    async execute(interaction: CommandInteraction) {
        
    }
}