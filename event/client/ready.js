const { on } = require('../../app')
const { isDebug } = require('../../functions/general/env')

const { add } = require('../../eventHandle/guildMember/add')

const guildMemberAdd = () => on('guildMemberAdd', member => {
    if (!isDebug()) add(member)
})

module.exports = { guildMemberAdd: guildMemberAdd }
