import { tryCatch } from "../../../classes/Basic/GeneralTypes";
import { Chat } from "../../../classes/LLM/Chat";
import { GrokModels } from "../../../classes/LLM/Wrapper";
import { MessageCommand, Report } from "../../../classes/MessageFeature";
import config from '../../../config.json';
import { tag } from "../../../functions/general/string";

export const t: MessageCommand = {
    name: 't',
    param: {
        required: false,
        pattern: ''
    },
    verify(message) {
        return [true, null];
    },
    async exe(message, commandInfo): Promise<Report> {
        if (!message.channel.isSendable()) return { success: true };

        message.channel.sendTyping();

        const [response, error] = await GrokModels.Grok_3_mini.post(
            config.models.grok.keys[0],
            {
                messages: [
                    {
                        role: 'system',
                        content: 'to use discord\'s reply feature, reply to a message with this syntax\n' +
                            tag('reply', '<the message ID>'),
                    }, {
                        role: 'user',
                        content: tag('messageID', message.id) + '\n' +
                            'content: ' + message.content,
                        name: message.author.displayName
                    }, {
                        role: 'system',
                        content: "try reply to the user"
                    }
                ],
                search_parameters: {
                    mode: 'off',
                    return_citations: true,
                },
                stream_options: {
                    include_usage: false
                },
                // stream: true
            }
        );

        // if (response) {
        //     const content = response.choices[0].message.content!;
        //     console.log(content);

        //     const replyID = Chat.ReplyTagRegex.exec(content)?.[1];
        //     console.log(replyID);

        //     if (replyID) {
        //         const [rpMessage, err] = await tryCatch(message.channel.messages.fetch(replyID));
        //         if (rpMessage) {
        //             try {
        //                 await rpMessage.reply(content);
        //             } catch (e) {
        //                 console.error('Failed to reply:', e);
        //                 message.channel.send('Failed to reply to the message: ' + replyID);
        //             }
        //         } else {
        //             message.channel.send('Reply message not found: ' + replyID);
        //         }
        //     } else {
        //         message.channel.send(content);
        //     }
        // }
        return { success: true }
    }
};
