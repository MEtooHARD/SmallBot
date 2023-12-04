
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] })

const on = (event = '', callback = () => { }) => { if (event) client.on(event, callback) }

const once = (event = '', callback = () => { }) => { if (event) client.once(event, callback) }

const login = token => client.login(token)

module.exports = {
    on: on,
    once: once,
    login: login,
    client: client,
}