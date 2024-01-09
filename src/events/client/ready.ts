import { on } from '../../app';
import { Client, Events } from 'discord.js';
import clientReady from '../../handleEvent/client/ready';

const ready = () => {
    console.log('on ' + Events.ClientReady);
    on(Events.ClientReady, async (client: Client) => {
        await clientReady(client);
    });
}


export = ready;