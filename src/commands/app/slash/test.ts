import { ChatInputCommandInteraction, InteractionContextType, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { Activity, ActivityManager } from "../../../classes/Activity";
import { Result_ } from "../../../classes/Basic/GeneralTypes";
import { ChatInputValidator, SlashCommand } from "../../../classes/Command";
import { Chat } from "../../../classes/LLM/Chat";
import { delaySec } from "../../../functions/general/delay";

export class test extends SlashCommand {
    activated = true;

    guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM
        )
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('.')
        );

    verify: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result_<string, string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
        const [activity, err] = ActivityManager.registerActivity(
            interaction.channel! as TextChannel,
            Chat
        )
        if (activity) {
            interaction.reply({
                // flags: 'Ephemeral',
                content: 'activity registered',
            });
            await delaySec(60);
            if (interaction.channel) {
                ActivityManager.revokeActivity(interaction.channel.id, activity);
                interaction.followUp({
                    // flags: 'Ephemeral',
                    content: `activity revoked`
                });
            }
        } else {
            interaction.reply({
                // flags: 'Ephemeral',
                content: `failed registering activity`
            });
        }
    }
}
