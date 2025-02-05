import chalk from 'chalk';
import { Client } from 'discord.js';
import { session } from '../app';
import { SlashCommands } from '../commands';

const clientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log('logged in as ' + chalk.bgYellow(session));
    console.log(`${SlashCommands.size()} (/): ${[...SlashCommands.keys()].join(', ')}`);
}

export = clientReady;