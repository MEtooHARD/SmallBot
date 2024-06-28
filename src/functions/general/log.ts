import chalk from "chalk";
import { CommandInteraction, Message } from "discord.js";
import { prefix } from "../../app";

const logCommand = (interaction: CommandInteraction): void => {
    console.log(`${chalk.bgBlackBright(new Date().toISOString())}\n` +
        `\t${chalk.blueBright(interaction.user.username)} in ${chalk.greenBright(interaction.guild?.name)}\n` +
        `\t\t/${chalk.yellow(interaction.commandName)}`);
}

const logMsgCommand = (message: Message, command: string): void => {
    console.log(`${chalk.bgBlackBright(new Date().toISOString())}\n` +
        `\t${chalk.blueBright(message.author.username)} in ${chalk.greenBright(message.guild?.name)}\n` +
        `\t\t${prefix}!${chalk.yellow(command)}`);
}

const logMsgFeature = (message: Message, feature: string): void => {
    console.log(`${chalk.bgBlackBright(new Date().toISOString())}\n` +
        `\t${chalk.blueBright(message.author.username)} in ${chalk.greenBright(message.guild?.name)}\n` +
        `\t\ttriggerred ${chalk.yellow(feature)}`);
}

export {
    logCommand,
    logMsgCommand,
    logMsgFeature
}