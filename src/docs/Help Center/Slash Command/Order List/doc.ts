import { Colors, EmbedBuilder, EmbedData } from "discord.js";

const doc = (): EmbedBuilder => {
  return new EmbedBuilder({
    // author: { name: HelpCenter.DisplayName },
    color: Colors.DarkGreen,
    title: 'Order List',
    description: '</order_list:1183464374162182144>\n' +
      'Create an order list, which users can add and edit their order. And I\'ll sum up the prices for you.',
    footer: { text: 'last edited: 2024-01-19' }
  });
};

export = doc;