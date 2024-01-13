const { REST, Routes } = require('discord.js');
import config from './config.json';
const fs = require('node:fs');
const path = require('node:path');

const deployCommand = async () => {

	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(__dirname, 'handleEvent', 'interaction', 'create', 'command');
	const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	const commands = commandFiles.map((file: string) => require('./handleEvent/interaction/create/command/' + file).data)

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: '10' }).setToken(config.bot.main.token);

	// and deploy your commands!
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(config.bot.main.id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}

export = deployCommand;