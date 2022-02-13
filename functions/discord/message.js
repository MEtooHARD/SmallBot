


// reverse a string but without reversing emojis
const reverseMsg = msg => {
    const emojiRE = /(<:[^:\s]*(?:::[^:\s]*)*:[[0-9]+>)/
    const content = msg.split(emojiRE)
    return reversed = content
        .map(str => emojiRE.test(str)
            ? str
            : str.split('').reverse().join('')
        )
        .reverse()
        .join('')
}

module.exports = {
    reverse: reverseMsg
}
