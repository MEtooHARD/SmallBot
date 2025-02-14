import { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits } from "discord.js";
import { CommandExecutor, CommandValidator, MessageContextMenuCommand } from "../../classes/Command";
import { Result } from "../../classes/GeneralTypes";
import { randomInt } from "../../functions/general/number";
import homo from "../../functions/general/homo";
import { sendDebugMessage } from "../../events/other/unknowError";

export class ii45i4_mc extends MessageContextMenuCommand {
    activated: Readonly<boolean> = true;

    requiredPerms: bigint[] = [PermissionFlagsBits.SendMessages];

    data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
        .setName('114514')
        .setType(ApplicationCommandType.Message)
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        )
        .setIntegrationTypes(
            ApplicationIntegrationType.UserInstall,
            ApplicationIntegrationType.GuildInstall
        );

    validator: CommandValidator<ApplicationCommandType.Message> = (interaction): Result<string> => {
        return [/\d/.test(interaction.targetMessage.content), "Message does not contain any number."];
    };

    executor: CommandExecutor<ApplicationCommandType.Message> = async (interaction) => {
        const numbers = interaction.targetMessage.content.match(/\d+/gm) as RegExpMatchArray;
        const theOneChosenShit = numbers[randomInt(0, numbers.length - 1)];
        const result = homo(Number(theOneChosenShit));
        try {
            await interaction.reply(`${theOneChosenShit} = \`${result}\``);
            // # <:810:1339066209957838969>
        } catch (e) {
            sendDebugMessage(e, 'unhandledRejection')
        }
    };
}