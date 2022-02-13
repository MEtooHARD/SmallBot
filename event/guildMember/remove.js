

const { on } = require('../../app')
const { isDebug } = require('../../functions/general/env')

const { remove } = require('../../eventHandle/guildMember/remove')

const guildMemberRemove = () => on('guildMemberRemove', member => {
    if (!isDebug()) remove(member)
})

module.exports = { guildMemberRemove: guildMemberRemove }
  