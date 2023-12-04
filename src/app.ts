import { Client, Intents, Snowflake } from "discord.js";
const client = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MEMBERS,
        ]
    }
);

const on = (event = '', callback = () => { }) => { if (event) client.on(event, callback) };

const once = (event = '', callback = () => { }) => { if (event) client.once(event, callback) };

const login = (token: Snowflake) => client.login(token);

module.exports = {
    on,
    once,
    login,
    client
}