const fs = require('node:fs');
const path = require('node:path');

console.log(fs.readdirSync(path.join('dist')))