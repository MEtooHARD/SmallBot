import { Colors, EmbedBuilder, EmbedData } from "discord.js";

const doc = (): EmbedBuilder => {
  return new EmbedBuilder({
    color: Colors.DarkPurple,
    title: 'Referendum',
    description: 'A referendum, the process by which decisions, on proposals, laws, and policies, are made directly by the people, is considered a symbol of a democratic society and reflects people\'s trust in management power.',
    fields: [{
      name: 'Proposals',
      value: 'A proposal is composed of title, description and purpose. And additional information like proposer and uploader(uploader is automatically recorded by the system and is shown in mentions).',
      inline: true
    }],
    footer: { text: 'last edited: 2024-07-22' }
  })
}

export = doc;