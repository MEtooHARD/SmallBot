
const { client } = require('../../../../app')

const channel = id => client.channels.cache.get(id)

module.exports = { channel: channel }
