import { EmbedBuilder } from "discord.js";

const FunFacts = (): EmbedBuilder => {
  return new EmbedBuilder({
    author: { name: 'You Suck' },
    title: 'You Suck',
    description: 'You Suck',
    fields: [
      {
        name: 'You Suck',
        value: 'You Suck'
      }
    ],
    footer: { text: 'You Suck' }
  })
}

export = FunFacts;