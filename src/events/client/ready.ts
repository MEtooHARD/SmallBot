import { on } from '../../app';
import { Client, Events } from 'discord.js';
import clientReady from '../../handleEvent/client/ready';

const ready = () => {
    on(Events.ClientReady, async (client: Client) => {
        await clientReady(client);
    });
}

export = ready;