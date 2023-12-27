import chalk from "chalk";
import { CommandInteraction } from "discord.js";

const logCommand = (interaction: CommandInteraction): void => {
    console.log(`<${new Date().toISOString()}>\n` +
        `\t<${interaction.user.username}> at <${interaction.guild}}>\n` +
        `\t\tcommand <${interaction.commandName}>`);
}

export {
    logCommand
}