import { ButtonInteraction, Locale } from "discord.js";
import { atUser } from "../../../functions/discord/mention";
import { delaySec } from "../../../functions/general/delay";
import { byChance, randomNumberRange } from "../../../functions/general/number";

export = async (interaction: ButtonInteraction) => {
    try { interaction.message.edit({ components: [] }); } catch (e) { }
    if (byChance(50)) {
        const collector = (await interaction.reply({
            content: atUser(interaction.user) + ' 這你也信?',
            fetchReply: true
        })).channel.createMessageCollector({ filter: message => message.author.id === interaction.user.id, time: 30 * 1000, max: 1 });

        collector.on('collect', async message => {
            await delaySec(randomNumberRange(4, 8));

            await message.channel.sendTyping();
            await delaySec(0.5);
            await message.reply(interaction.guild?.preferredLocale === Locale.ChineseTW ? '好啦好啦' : 'fine');
            await delaySec(randomNumberRange(1, 3));

            await message.channel.sendTyping();
            await delaySec(7);
            await message.reply('💵💴💶💷');
            await delaySec(randomNumberRange(1, 3));

            await message.channel.sendTyping();
            await delaySec(1);
            await message.reply((interaction.guild?.preferredLocale === Locale.ChineseTW ? '高興了嗎' : 'now glad?') + atUser(interaction.user));
        });
    } else {
        interaction.reply('兄弟，屁股賣我')
    }
}