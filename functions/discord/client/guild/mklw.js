

const { client } = require('../../../../app')
const { info } = require('../../../../config/info')

const mklw = () => client.guilds.cache.get(info.guildID)

module.exports = { mklw: mklw }
