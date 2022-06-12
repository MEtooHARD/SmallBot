const { selectMenu } = require('../handle/interaction/selectMenu')
const { button } = require('../handle/interaction/messageButton')

const reply = async interaction => {
    if(interaction.isButton()) {
        await button(interaction)
    } else {
        selectMenu(interaction)
    }
}

module.exports.reply = reply