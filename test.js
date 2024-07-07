// console.log(setTimeout(() => { }, 20));
const { EventEmitter } = require('events');

const test = new EventEmitter();

test.emit();

console.log(typeof test);
