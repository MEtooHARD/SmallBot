import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../classes/_Command";
import { Piece, TrackChess } from "../../../classes/games/TrackChess";
import { SlashCommand } from "../../../classes/Command";

export = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('track_chess')
        .setDescription('Start a Track Chess.')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('opponent')
            .setDescription('Choose your opponent.')
            .setRequired(true))
    ,
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const p1 = interaction.user;
        const p2 = (interaction.options.getUser('opponent') as User);
        const reply = await interaction.reply(TrackChess.inviteCheck(p1, p2));
        const collector = reply.createMessageComponentCollector({ max: 1, time: 5 * 60 * 1000, filter: interaction => interaction.user.id === p2.id });

        collector.on('collect', async interaction => {
            switch (interaction.customId) {
                case TrackChess.CustomIDs.Accept:
                    const trackChess = new TrackChess(p1, p2);
                    const game = await interaction.update(trackChess.update());
                    const clt = game.createMessageComponentCollector({ idle: 5 * 60 * 1000 });
                    clt.on('collect', interaction => {
                        if (trackChess.isNowActing(interaction.user))
                            if (interaction.customId === TrackChess.CustomIDs.Next) {
                                trackChess.putMark();
                                if (trackChess.checkWin())
                                    trackChess.win();
                                else if (trackChess.rotate(), trackChess.checkWin())
                                    trackChess.win();
                                else {
                                    trackChess.clear();
                                    trackChess.toggle();
                                }
                            } else {
                                const [x, y] = interaction.customId.slice(1).split('').map(x => Number(x));
                                trackChess.act = new Piece(x, y, trackChess.actingPlayerMark);
                            }
                        interaction.update(trackChess.update());
                    });
                    break;
                case TrackChess.CustomIDs.Deny:
                    interaction.update(TrackChess.inviteDenied(p1));
                    break;
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') reply.edit(TrackChess.inviteExpired(p1));
        });
    }
});