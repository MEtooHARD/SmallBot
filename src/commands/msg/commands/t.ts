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
        console.log(message.reference);
        return { success: true };
    }
};
