import { MessageCommand, Report } from "../../../classes/MessageFeature";

export const t: MessageCommand = {
    name: 't',
    param: {
        required: false,
        pattern: ''
    },
    verify(message) {
        return [true, null];
    },
    exe: async (message, commandInfo): Promise<Report> => {
        // if (!message.channel.isDMBased())
        // message.channel.send(message.content);
        console.log(message.content);
        return { success: true };
    }
};
