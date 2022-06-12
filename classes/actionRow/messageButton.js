const { MessageButton } = require('discord.js')

class Button extends MessageButton {
    constructor({customId, label, style, url, disabled, emoji}) {
        super()
        if (customId) this.setCustomId(customId)
        if (label) this.setLabel(label)
        if (style) this.setStyle(style)
        if (url) this.setURL(url)
        if (disabled) this.setDisabled(disabled)
        if (emoji) this.setEmoji(emoji)
    }
    
}

module.exports.Button = Button

