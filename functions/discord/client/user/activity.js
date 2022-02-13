

const { client } = require('../../../../app')

const setActivity = (name = null, options = null) => client.user.setActivity(name, options)

module.exports = { setActivity: setActivity }
