
const { play } = require('../vcfunctions')

const selectMenu = async interaction => {

    const customId = interaction.customId
    const channel = interaction.channel
    const selection = interaction.values[0]
    if(customId == 'playSong') {
        console.log('selectd song')
        const voiceChannel = interaction.member.voice.channel
        //VALUE：name;videoUrl;durarion;isLive;thumbnail;uploaderName
        console.log('fine')
        play(voiceChannel, selection, { member: interaction.member, textChannel: channel })

        interaction.message.edit({
            embeds: [{
                color: 'AQUA',
                title: '已選擇歌曲'
            }],
            components: []
        })
        
    }
}

module.exports = { selectMenu: selectMenu }
