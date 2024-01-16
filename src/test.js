const fs = require('node:fs');
const path = require('node:path');

console.log(fs.readdirSync(path.join('docs', 'HelpCenter')))
console.log(path.join('docs', 'HelpCenter'))

console.log(fs.readdirSync('../docs/HelpCenter'))