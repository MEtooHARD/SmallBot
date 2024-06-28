import { Client, ClientEvents, IntentsBitField } from "discord.js";

const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildVoiceStates
        ]
    }
);

export const on = (event: keyof ClientEvents, callback = (...inputs: any) => { }) => {
    client.on(event, callback);
    console.log('client on ' + event);
};

export const login = async (token: string) => { client.login(token) };

export const [prefix, divider] = ['s', '!'];

export const shouldDeployCommand = true;

enum Session {
    dev = 'dev',
    main = 'main'
}

export const session = Session['main'];