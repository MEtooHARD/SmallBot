import config from '../../config.json';
import { processStream } from "../../functions/general/stream";
import { GrokModel, GrokModels } from './Wrapper';

const Grok_4 = GrokModels.Grok_4_0709;
const Grok_3_mini = GrokModels.Grok_3_mini;

(async () => {
    const [response, error] = await Grok_4.post(
        config.grok.key,
        {
            messages: [
                {
                    role: 'user',
                    content: 'some content',
                    name: 'david'
                }, {
                    role: 'system',
                    content: "what's the user's name? respond shortly"
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

    // console.log(response);
    console.log("=========================");
    // console.log(response?.body);
    console.log("=========================");
    if (response) {
        console.log(response.choices[0].message.content);
        //     processStream(response.body.getReader(),
        //         (data) => {
        //             if (data === '[DONE]') {
        //                 console.log('Stream completed');
        //                 return;
        //             }
        //             //@ts-ignore
        //             const json = JSON.parse(data.slice(6));
        //             if (json.choices[0]?.delta?.content) {
        //                 console.log(json.choices[0].delta.content);
        //                 console.log(json.choices[0].delta);
        //             }
        //             else {
        //                 console.log(json);
        //                 console.log(json.choices[0]);
        //             }
        //             console.log('===')
        //             // return json.choices[0].message.content;
        //         },
        //         (error) => {
        //             console.error('Error processing stream:', error);
        //         }
        //     );
    } else {
        console.error('Error:', error);
    }

    // if (response) {
    //     console.log(response.usage);
    //     console.log("=========================");
    //     console.log(response);
    //     console.log("=========================");
    //     console.log(response.choices[0].message.content);
    //     console.log("=========================");
    //     console.log(response.choices[0].message.reasoning_content);
    // } else {
    //     console.error('Error:', error);
    // }
})();