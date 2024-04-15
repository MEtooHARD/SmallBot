import chalk from 'chalk';
import { Client } from 'discord.js';

const clientReady = async (client: Client): Promise<void> => {
    console.log('[client] ' + chalk.green('ready'));
}

export = clientReady;