import { ButtonInteraction } from "discord.js";
import { atUser } from "../../../../functions/discord/mention";
import { delaySec } from "../../../../functions/general/delay";
import { randomNumberRange } from "../../../../functions/general/number";

export = async (interaction: ButtonInteraction) => {
    let reply = await interaction.reply({
        content: atUser(interaction.user) + ' 這你也信?',
        fetchReply: true
    });
    await delaySec(randomNumberRange(4, 8));
    reply = await reply.reply('好啦好啦');
    await delaySec(randomNumberRange(2, 5));
    reply = await reply.reply('💵💴💶💷');
    await delaySec(randomNumberRange(1, 3));
    reply = await reply.reply('高興了嗎' + atUser(interaction.user));
}