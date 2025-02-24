import { ButtonInteraction, Locale, Message } from "discord.js";
import { atUser } from "../../../functions/discord/mention";
import { delaySec } from "../../../functions/general/delay";
import { byChance, randomNumberRange } from "../../../functions/general/number";
import { earn500 } from "../../../functions/discord/cmps";

export = async (interaction: ButtonInteraction): Promise<void> => {

    await interaction.update({ components: earn500(true) });

    if (byChance(50)) {
        const reply = await interaction.followUp({
            content: atUser(interaction.user) + ' 這你也信?',
        });
        if (reply.channel.isDMBased()) return;

        const collector = reply.channel
            .createMessageCollector({ filter: message => message.author.id === interaction.user.id, time: 30 * 1000, max: 1 });

        collector.on('collect', async (message: Message) => {
            if (message.channel.isDMBased()) return;
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