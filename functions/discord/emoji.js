

const { deepCopy } = require('../general/object')
const { envDelimiter, parseEnv } = require('../general/env')



// configure the emojis of a guild
const configEmojis = emojis => process.env.emojis = deepCopy(emojis)
    .map(emoji => emoji.identifier)
    .join(envDelimiter)

// return the identifier of a emoji (with pre-processed emoji list)
const getEmoji = name => parseEnv('emojis')
    .find(emoji => emoji.startsWith(name.replace(':', '')))

// convert :emoji: from string to emoji on discord
const encodeEmojis = msg => {
    const re = /(:[^\:\n]+:)/
    const content = msg.split(re)
    return content
        .map(str => re.test(str) ? '<:' + getEmoji(str) + '>' : str)
        .join('')
}

module.exports = {
    config: configEmojis,
    encode: encodeEmojis
}

