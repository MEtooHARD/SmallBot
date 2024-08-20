import { Colors, EmbedBuilder } from "discord.js";

const LiteraryInquisition = (): EmbedBuilder => {
  return new EmbedBuilder({
    // author: { name: HelpCenter.DisplayName },
    color: Colors.DarkRed,
    title: 'Literary Inquisition',
    description: 'By conditions, SmallBot randomly responds your messages. <3',
    footer: { text: 'last edited: 2024-06-27' }
  })
}

export = LiteraryInquisition;