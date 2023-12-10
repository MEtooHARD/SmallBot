import { Client, IntentsBitField, Snowflake } from "discord.js";
const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers,
        ]
    }
);

const on = (event = '', callback = (dummy: any) => { }) => { if (event) client.on(event, callback) };

// const once = (event = '', callback = () => { }) => { if (event) client.once(event, callback) };

const login = (token: string) => client.login(token);

export {on, /* once, */ login, client};