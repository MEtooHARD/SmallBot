import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import SuperMarket from "../../../classes/SuperMarket";
import { byChance } from "../../../functions/general/number";
import { atUser } from "../../../functions/discord/mention";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('supermarket')
        .setDescription('supermarket someone.')
        .addUserOption(option => option
            .setName('object')
            .setDescription('the poor.')
            .setRequired(true))
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const loli = interaction.options.getUser('object');

        if (loli) {
            if (byChance(0))
                interaction.reply(`@here guys, never be like this poor orphan fuck others on the internet.`);
            else {
                if (interaction.channel) {
                    if (!loli.bot) {
                        if (loli.id !== interaction.user.id) {
                            const supermarket = new SuperMarket(interaction.user, loli);
                            const infoPage = supermarket.infoPage();

                            infoPage.setMessage((await interaction.reply({
                                fetchReply: true,
                                ephemeral: infoPage.ephemeral,
                                content: infoPage.content,
                                embeds: infoPage.embeds,
                                components: infoPage.components,
                            }))).start();
                        } else {
                            interaction.reply('@here 怎麼會有人想超自己啊');
                        }
                    } else
                        interaction.reply('雖然這個社會不排斥跨物種性關係，我勸你還是好好想想自己到底在幹嘛，你他媽居然想超' + atUser(loli));
                }
            }
        }
    }

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}