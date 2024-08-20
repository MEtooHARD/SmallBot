import { Colors, EmbedBuilder } from "discord.js";

const LifeCycle = (): EmbedBuilder => {
  return new EmbedBuilder({
    color: Colors.DarkPurple,
    title: 'Life Cycle',
    description: 'A referendum will go through three stages: Prepare, Vote and Close.',
    fields: [{
      name: 'Prepare',
      value: 'The initiator can modify the title, description and entitled list. There must be at least 1 proposal to start, and at most 6.',
      inline: true
    }, {
      name: 'Vote',
      value: 'Whoever have access to the channel are granted to vote.',
      inline: true
    }, {
      name: 'Close',
      value: 'The initiator can choose to close, the result of each proposal will be revealed.',
      inline: true
    }],
    footer: { text: 'last edited: 2024-07-22' }
  })
}

export = LifeCycle;