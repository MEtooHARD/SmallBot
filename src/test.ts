
// function tag1(tag: string, content: string): string {
//     return `<${tag}>${content}</${tag}>`;
// }

import { Chat } from "./classes/LLM/Chat";

// function tag2(tag: string, content: string): string {
//     return '<' + tag + '>' + content + '</' + tag + '>';
// }

// const start1 = Date.now();
// for (let i = 0; i < 9999999999; i++) {
//     tag1('t', 'sdasddsfsdfsdfsdfs');
// }
// const end1 = Date.now();
// console.log('Time1: ' + (end1 - start1) + 'ms');


// const start2 = Date.now();
// for (let i = 0; i < 9999999999; i++) {
//     tag2('t', 'sdasddsfsdfsdfsdfs');
// }
// const end2 = Date.now();
// console.log('Time2: ' + (end2 - start2) + 'ms');

const content = `<action>h</action>
<bction>hasdasdasd</bction>`;

const reg = /^<(\w+?)>(.+?)<\/\1>$/gm;

console.log(content.matchAll(reg).toArray());
