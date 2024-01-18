import { Client } from 'discord.js';

const clientReady = async (client: Client): Promise<void> => {
    console.log('[client] ready');
}

export = clientReady;