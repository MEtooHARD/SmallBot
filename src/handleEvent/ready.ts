import chalk from 'chalk';
import { Client } from 'discord.js';
import { session } from '../app';
import { CM } from '..';

const clientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log('logged in as ' + chalk.bgYellow(session));
    console.log(`${CM.amount()} (/): ${[...CM.keys()].join(', ')}`);
}

export = clientReady;