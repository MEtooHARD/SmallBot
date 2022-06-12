const { client } = require('../app')

const play = (voiceChannel, urlOrSong, channel, member) => {
    client.distube.play(voiceChannel, urlOrSong, {textChannel: channel, member: member})
}

const control = (voiceChannel, volume) => {
    client.distube.setVolume(voiceChannel, volume)
}

const pause = (guildId) => {
    client.distube.pause(guildId)
}

const resume = (guildId) => {
    client.distube.resume(guildId)
}

const disconnect = (guildId) => {
    client.distube.stop(guildId)
}

const skip = (guildId) => {
    client.distube.skip(guildId)
}

const search = (name, options) => {
    return client.distube.search(name, options)
}

const check = async guildId => {
    return await client.distube.getQueue(guildId)?.songs
}

const setRepeatMode = (guildId, num) => {
    client.distube.setRepeatMode(guildId, num)
}

const shuffle = (guildId) => {
    client.distube.shuffle(guildId)
}

const getVolume = (guildId) => {
    return client.distube.getQueue(guildId).volume
}

const setVolume = (guildId, percent) => {
    client.distube.setVolume(guildId, percent)
}

module.exports = {
    play: play,
    control: control,
    pause: pause,
    resume: resume,
    leave: disconnect,
    skip: skip,
    search: search,
    check: check,
    setRepeatMode: setRepeatMode,
    shuffle: shuffle,
    getVolume: getVolume,
    setVolume: setVolume
}