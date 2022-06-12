const { ActionRow } = require('../classes/actionRow')
const { client } = require('../app')
const { play, search, leave, control, pause, resume, check, getVolume } = require('./vcfunctions')
// const play = (channel, name) => client.distube.play(channel, name)
const atUser = (userId) => {return `<@${userId}>`}


creat = (msg) => {
    if(msg.author.id === client.user.id) return
    const content = msg.content
    const member = msg.member
    const authorID = msg.author.id
    const authorName = msg.author.name
    const guildId = msg.guildId

    const pushContents = (message) => {if(message) msg.channel.send(message)}
    
    let isCommand = false

    if(content.substring(0, 2) === 's!' && content.length > 3)  isCommand = true

    if(isCommand) {
        const voiceChannel = member.voice.channel
        const voiceChannelId = member.voice.channelId
        const botVoiceChannelId = msg.guild.me.voice.channelId
        console.log(guildId)
        

        let inputs = content.split(' ')
        const userCommand = inputs.shift().split('!').pop()
        const userInput = content.includes(' ') ? inputs.join(' ') : ''
        const evalC = (...matches) => matches.some(x => x === userCommand)

        if(userCommand === 'say' && userInput) {
            pushContents(userInput)
            msg.delete()
        } else if(evalC('play')) {  
            console.log('play')
            const ifYTur1 = /https:\/\/((www\.youtube\.com)|(youtu\.be))\/(watch\?v=)?(\w\w|-\w|\w-){5}\w/
            const ifYTur2 = /https:\/\/((www\.youtube\.com)|(youtu\.be))\/(watch\?v=)?\w(\w\w|-\w|\w-){5}/
            if(userInput) {
                
                    if((voiceChannelId && voiceChannelId !== botVoiceChannelId) || (botVoiceChannelId && voiceChannelId === botVoiceChannelId)) {
                        if(ifYTur1.test(userInput) && ifYTur2.test(userInput)) {
                            toggleDelete()
                            play(voiceChannel, userInput, channel, member)
                               
                                //pushContents({content: `我已在<#${voiceChannelId}>`})
                                
                                //pushContents({content: `Added a song.\nPlaying at <#${voiceChannelId}>`})
                                
                        } else if(userInput.includes('http')) {
                            fetch(messageId).then(message => {message.reply('It seems not a valid url.\nPlease enter a valid one.')})
                        } else {
                            
                            search(userInput).then(result => {
                                const songOptions = []
                                let text = ''
                                let songSelectMenuOptions = []
                                const completeTime = new Date().toLocaleTimeString("fr-CA").replace(' min ', ':').replace(' h ', ':').replace(' s', '')
                                for(let i = 0; i < result.length; i++) {
                                    text = text + "`" + String(i+1) + ".`" + ` ${result[i].name}\n\n`
                                    songSelectMenuOptions.push({
                                        label: String(i+1) + '. ' + result[i].formattedDuration,
                                        description: result[i].name,
                                        value: result[i].url
                                    })
                                }
                                songOptions.push({
                                    name: '\u200b',
                                    value: text.slice(0, -2)
                                })
                                const resultEmbed = {
                                    color: 0x0044ff,
                                    author: {name: 'MKLWBot Music'},
                                    //title: 'Search Results',
                                    fields: songOptions,
                                    footer: {text: `${userInput} 的搜尋結果. 時間: ${completeTime}. 用戶: ${authorName}.`}
                                }
                                pushContents({
                                    embeds: [resultEmbed],
                                    components: [new ActionRow({
                                        menus: [{
                                            customId: 'playSong',
                                            placeholder: 'Select a Song to Play',
                                            options:  songSelectMenuOptions 
                                        }]
                                    }),
                                    new ActionRow({
                                        buttons: [{
                                            customId: 'cancelSearch',
                                            label: 'Cancel Search',
                                            style: 'DANGER'
                                        }]
                                    })]
                                })
                            })
                        }                        
                    } else if(!voiceChannelId) {
                        pushContents(`Dear ${atUser(authorID)} comrade: You must be in a voice channel.`)
                    }
                    
            }
        } else if(evalC('queue', 'cq', 'checkqueue')) {
            check(guildId).then(songs => {
                console.log(songs)
                if(songs) {
                    setAsync()
                    let curentPlaying = {
                        color: 0x00ff8c,
                        author: {name: 'Current Playing'},
                        title: songs[0].name,
                        url: songs[0].url,
                        image: {url: songs[0].thumbnail},
                        fields: [{
                            name: '頻道',
                            value: songs[0].uploader.name,
                            inline: true
                        },{
                            name: '歌曲長度',
                            value: songs[0].isLive?'**🔴 LIVE**':songs[0].formattedDuration,
                            inline: true
                        },{
                            name: 'Playing at',
                            value: `<#${botVoiceChannelId}>`,
                            inline: true
                        }]
                    }
                    pushContents({embeds: [curentPlaying]})
                    //🇱​🇮​🇻​🇪    just put here to store
                    let queueFields = []
                    if(songs.length > 1) {
                        for(let i = 1; i < songs.length && i <= 3; i++) {
                            queueFields.push({
                                name: songs[i].name,
                                value: `歌曲長度: ${songs[i].formattedDuration}\n頻道: ${songs[i].uploader.name}`,
                                inline: false
                            })
                        }
                        pushContents({embeds: [{
                            color: 0x00ff8c,
                            fields: [queueFields],
                            footer: {text: '時間: ' + new Date().toLocaleTimeString('fr-CA').replace(' min ', ':').replace(' h ', ":").replace(' s', '') + '\n提交者: ' + authorName}
                        }]})
                    }
                    respond(res)
                } else {
                    pushContents({content: 'Im not Playing.'})
                }
            })
            
        } else if(evalC('mode')) {
            if(userInput && !isNaN(userInput) && (Number(userInput) >= 0 && Number(userInput) <= 2)) {
                setRepeatMode(guildId, Number(userInput))
            } else {
                pushContents({
                    embeds: [{
                        color: "BLUE",
                        
                        title: 'Choose a mode'
                    }],
                    components: [
                        new ActionRow({
                            buttons: [{
                                label: 'Disable',
                                style: 'PRIMARY',
                                customId: 'setMode0'
                            },
                            {
                                label: 'Song',
                                style: 'PRIMARY',
                                customId: 'setMode1'
                            },
                            {
                                label: 'Queue',
                                style: 'PRIMARY',
                                customId: 'setMode2'
                            },
                            /*{
                                label: 'Shuffle',
                                style: 'PRIMARY',
                                customId: 'setMode3'
                            }*/]
                        })]
                })
            }
        } else if(evalC('setVolume', 'setV', 'volume', 'setvolume')) {
            if(userInput && !isNaN(userInput) && (Number(userInput) >= 0 && Number(userInput) <= 100)) {
                const voiceChannel = member.voice.channel
                if(botVoiceChannelId && voiceChannel.id === botVoiceChannelId) {
                    control(voiceChannel, Number(userInput))
                    pushContents({
                        embeds: [{
                            color: 'AQUA',
                            title: `Set volume to ${userInput}`
                        }]
                    })
                }
            } else {
                const volume = String(getVolume(guildId))
                pushContents({
                    embeds: [{
                        color: "BLUE",
                        title: 'Select a volume',
                        description: 'or use `m!setVolume <percent>`\n**Current volume: **' + volume + '%',
                    }],
                    components: [
                        new ActionRow({
                            buttons: [{
                                label: '20',
                                style: 'PRIMARY',
                                customId: 'setV20'
                            },
                            {
                                label: '40',
                                style: 'PRIMARY',
                                customId: 'setV40'
                            },
                            {
                                label: '60',
                                style: 'PRIMARY',
                                customId: 'setV60'
                            },
                            {
                                label: '80',
                                style: 'PRIMARY',
                                customId: 'setV80'
                            }]
                        })]
                })
            }
        } else if(evalC('pause', 'stop')) {
                if(botVoiceChannelId) {
                    if((voiceChannelId === botVoiceChannelId)) {
                        pause(guildId)
                        pushContents(`Paused. Channel: <#${voiceChannelId}>`)
                    }
                } else {
                    pushContents('Im not playing.')
                }
                
        } else if(evalC('continue', 'keep', 'resume')) {
            if(botVoiceChannelId) {
                if(voiceChannelId === botVoiceChannelId) {
                    resume(guildId)
                    pushContents(`Resumed. Channel: <#${voiceChannelId}>`)
                } 
            } else {
                pushContents('Im not playing.')
            }
        } else if(evalC('leave', 'fuckoff')) {
            if(botVoiceChannelId) {
                if(voiceChannelId === botVoiceChannelId) {
                    leave(guildId)
                    pushContents(`Leaved QQ. Channel: <#${voiceChannelId}>`)
                }
            } else {
                pushContents('Im not playing.')
            }
        } else if(evalC('skip')) {
            if(botVoiceChannelId) {
                if(voiceChannelId === botVoiceChannelId) {
                    
                    pushContents(`Skipped. Channel: <#${voiceChannelId}>.`)
                }
            } else {
                pushContents('Im not Playing')
            }
        }
    }
}


module.exports = {
    creat: creat
}