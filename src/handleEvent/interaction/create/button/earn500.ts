import { ButtonInteraction, Locale } from "discord.js";
import { atUser } from "../../../../functions/discord/mention";
import { delaySec } from "../../../../functions/general/delay";
import { randomNumberRange } from "../../../../functions/general/number";

export = async (interaction: ButtonInteraction) => {
    const collector = (await interaction.reply({
        content: atUser(interaction.user) + ' 這你也信?',
        fetchReply: true
    })).channel.createMessageCollector({ filter: message => message.author.id === interaction.user.id, time: 15 * 1000 });

    collector.on('collect', async message => {
        await delaySec(randomNumberRange(4, 8));
        message = await message.reply(interaction.guild?.preferredLocale === Locale.ChineseTW ? '好啦好啦' : 'fine');
        await delaySec(randomNumberRange(2, 5));
        message = await message.reply('💵💴💶💷');
        await delaySec(randomNumberRange(1, 3));
        message = await message.reply((interaction.guild?.preferredLocale === Locale.ChineseTW ? '高興了嗎' : 'now glad?') + atUser(interaction.user));
    });
}