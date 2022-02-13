

const { info } = require('../../config/info')
const { getObjectValues } = require('../general/object')
const { isDebug, isReady } = require('../general/env')


const shouldReactMsg = ({ channel, author }) => {
    if (!isReady()) return 0
    if (author.bot) return 0
    if (isDebug()) return getObjectValues(info.testCategories).includes(channel.parentId)
    return !(getObjectValues(info.testChannels).includes(channel.id) || getObjectValues(info.testCategories).includes(channel.parentId))
}

const shouldReactInteraction = (authorID) => {
    if (!isReady()) return 0
    if (isDebug()) return (authorID === info.devBotID)
    return (authorID !== info.prodBotID)
}

module.exports = {
    shouldReactMsg: shouldReactMsg,
    shouldReactInteraction: shouldReactInteraction,
}