import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";

const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.MessageContent,
        ]
    }
);

const on = (event = '', callback = (dummy: any) => { }) => {
    if (event) {
        console.log('on ' + event);
        client.on(event, callback);
    }
};

const test = () => client

const login = (token: string) => client.login(token);

const [prefix, divider] = ['s!', '!'];

export {
    on,
    login,
    prefix,
    divider,
    test
};