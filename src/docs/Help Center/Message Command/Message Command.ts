import { Colors, EmbedData } from "discord.js";
import { HelpCenter } from "../../../classes/HelpCenter";

const MessageCommand = (): EmbedData => {
    return {
        // author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Message Command',
        description: 'Here you can find some message commands.\n' +
            'By adding a prefix, `s!`, to trigger the command.\n' +
            'The formats are like `s!command <param1> <param2> ...`\n' +
            'The contents between `<` and `>` are what you can customize. And please ignore the `<` & `>`.',
        footer: { text: 'last edited: 2024-01-18' }
    }
}

export = MessageCommand;