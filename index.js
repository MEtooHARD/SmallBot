
// origin/development
/* Dependencies */
const { login } = require('./app')

const { ready } = require('./event/client/ready')
const { messageCreate } = require('./event/message/create')
const { messageUpdate } = require('./event/message/update')
const { interactionCreate } = require('./event/interaction/create')
const { guildMemberAdd } = require('./event/guildMember/add')
const { guildMemberRemove } = require('./event/guildMember/remove')
/* Dependencies */

/* Deployment Preparation */
const debug = true
process.env.mode = debug ? 'dev' : 'prod'
process.env.shouldReload = false
/* Deployment Preparation */

/* Set Token */
const token = debug ? require('./config.json').devToken : process.env.token
/* Set Token */

/* init */
process.env.ready = false

ready()
messageCreate()
messageUpdate()
interactionCreate()
guildMemberAdd()
guildMemberRemove()


/* Get Online for Service */
login(token)
/* Get Online for Service */
