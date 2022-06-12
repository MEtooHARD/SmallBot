const { client, login } = require('./app')
const { DisTube } = require('distube')
const { creat } = require('./handle/message')
const { reply } = require('./handle/interaction')

//const { SpotifyPlugin } = require('@distube/spotify')

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    //plugins: [new SpotifyPlugin()]
})

login()

client.on('messageCreate', msg => {
    creat(msg)
})


client.on('interaction', interaction => {
    reply(interaction)
})
