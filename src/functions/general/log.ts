import chalk from "chalk";
import { CommandInteraction } from "discord.js";

const logCommand = (interaction: CommandInteraction): void => {
    console.log(`${chalk.bgBlackBright(new Date().toISOString())}\n` +
        `\t${chalk.blueBright(interaction.user.username)} at ${chalk.greenBright(interaction.guild?.name)}\n` +
        `\t\t/${chalk.yellow(interaction.commandName)}`);
}

export {
    logCommand
}