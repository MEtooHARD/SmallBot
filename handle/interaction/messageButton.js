const {setRepeatMode, setVolume} = require('../vcfunctions')
const button = async interaction => {
    let reply = ''

    const customId = interaction.customId
    const channel = interaction.channel
    let channelReply = ''
    const guildId = interaction.guildId
    if(customId == 'cancelSearch') {
        interaction.update({embeds: [{
            color: 'RED',
            author: {name: 'SmallBot'},
            title: 'Search Canceled'
        }],
        components: []})
    } else if(customId.startsWith('setMode')) {
        const mode = Number(customId.replace('setMode', ''))
        let modeText
        switch(mode) {
            case 0: modeText = 'Disabled'; break;
            case 1: modeText = 'Song'; break;
            case 2: modeText = 'Queue'; break;
        }

        interaction.update({
            embeds: [{
                color: "AQUA",
                description: "**Set mode as:** `" + modeText + "`"
            }],
            components: []
        })
        setRepeatMode(guildId, mode)
    } else if(customId.startsWith('setV')) {
        const volume = Number(customId.replace('setV', ''))
        setVolume(guildId, volume)
        interaction.update({
            contents:'',
            embeds: [{
                color: 'AQUA',
                title: `Set volume to ${volume}`
            }],
            components: []
        })
    }

    if (reply) await interaction.reply({content: reply})
    if (channelReply) channel.send(channelReply)
}

module.exports = { button: button }