import chalk from "chalk";
import { CommandInteraction, Message } from "discord.js";
import { isDev, prefix } from "../../app";

export function timestamp(): string { return chalk.bgBlackBright(new Date().toISOString()); }

export const logSlashCommand = (interaction: CommandInteraction): void => {
    console.log(timestamp() +
        `\n\t${chalk.blueBright(interaction.user.username)} in ${chalk.greenBright(interaction.guild?.name)}\n` +
        `\t\t/${chalk.yellow(interaction.commandName)}`);
}

export const logMsgMenuCommand = (interaction: CommandInteraction): void => {
    console.log(timestamp() +
        `\n\t${chalk.blueBright(interaction.user.username)} in ${chalk.greenBright(interaction.guild?.name)}\n` +
        `\t\tMCM ${chalk.yellow(interaction.commandName)}`);
}

export const logMsgCommand = (message: Message, command: string): void => {
    console.log(timestamp() +
        `\n\t${chalk.blueBright(message.author.username)} in ${chalk.greenBright(message.guild?.name)}\n` +
        `\t\t${prefix}!${chalk.yellow(command)}`);
}

export const logMsgFeature = (message: Message, feature: string): void => {
    console.log(timestamp() +
        `\n\t${chalk.blueBright(message.author.username)} in ${chalk.greenBright(message.guild?.name)}\n` +
        `\t\ttriggerred ${chalk.yellow(feature)}`);
}

export function dev_log(message?: any, ...optionalParams: any[]): void {
    if (isDev) console.log(chalk.gray('[DEV]'), message, ...optionalParams);
}