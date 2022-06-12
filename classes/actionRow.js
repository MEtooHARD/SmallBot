const { MessageActionRow } = require('discord.js')
const { Button } = require('./actionRow/messageButton')
const { Menu } = require('./actionRow/messageSelectMenu')

class ActionRow extends MessageActionRow {
    constructor({buttons, menus}) {
        super()
        if(buttons) this.addComponents(buttons.map(button => new Button(button)))
        if(menus) this.addComponents(menus.map(menu => new Menu(menu)))
    }
}

module.exports.ActionRow = ActionRow
