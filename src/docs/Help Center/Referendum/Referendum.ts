import { Colors, EmbedData } from "discord.js";

const Referendum = (): EmbedData => {
    return {
        color: Colors.DarkPurple,
        title: 'Referendum',
        description: 'Referendum, the process of decisions to proposals, laws and policies that directly made by guild(server) members, is considered a symbol of democratic society. Here, a referendum is mainly composed of one or several proposals.',
        fields: [{
            name: 'Proposals',
            value: 'A proposal is composed of title, description and purpose. And additional information like proposer and uploader(uploader is automatically recorded by the system and is shown in mentions).',
            inline: true
        }],
        footer: { text: 'last edited: 2024-07-22' }
    }
}

export = Referendum;