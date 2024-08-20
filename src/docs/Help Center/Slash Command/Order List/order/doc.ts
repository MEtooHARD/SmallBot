import { Colors, EmbedBuilder, EmbedData } from "discord.js";

const doc = (): EmbedBuilder => {
  return new EmbedBuilder({
    // author: { name: HelpCenter.DisplayName },
    color: Colors.DarkGreen,
    title: 'Order',
    description: 'Users can add their order by clicking the `order` button below the message.\n' +
      'Click the `order` button again to modify the ordering content.',
    footer: { text: 'last edited: 2024-01-19' }
  })
}

export = doc;