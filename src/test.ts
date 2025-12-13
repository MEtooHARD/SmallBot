import config from './config.json';


const gemini_key = config.models.gemini.keys[0];

(async () => {

    const contents: Contents = [
        {
            role: 'user',
            parts: [
                {
                    text: 'hi, how are you?'
                },
                {
                    text: 'write a poem about friendship.'
                }
            ]
        },
        // {
        //     role: 'user',
        //     parts: [
        //         {
        //             text: 'write a poem about friendship.'
        //         }
        //     ]
        // }
    ]

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
            method: 'POST',
            headers: {
                'x-goog-api-key': gemini_key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents: contents })
        });

    // console.log('response:', response);
    if (response.ok) {
        const data: any = await response.json();
        // console.log('data:', data);
        console.log('response text:', data.candidates[0].content);
    }
})();

type Role = 'user' | 'model';
type Part = { text: string };
type UserContent = {
    role: 'user',
    parts: Array<Part>
}
type ModelContent = {
    role: 'model',
    parts: Array<Part>
}
type Content = UserContent | ModelContent;
type Contents = Array<Content>;