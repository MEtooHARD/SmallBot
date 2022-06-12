const { MessageSelectMenu } = require('discord.js')

class Menu extends MessageSelectMenu {
    constructor({customId, placeholder, options}) {
        super()
        if(customId) this.setCustomId(customId)
        if(placeholder) this.setPlaceholder(placeholder)
        if(options) this.setOptions(options)
    }
}

module.exports.Menu = Menu