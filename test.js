const path = require('node:path');
const fs = require('node:fs');

// console.log(path.join('src', 'c') + '\n');
// fs.readdirSync(path.join('src', 'classes'))
//     .forEach(x => {
//         console.log(x);
//     });

/**
 * 
 * @param {string} startPath 
 */
/* const fetchDoc = (startPath) => {
    return fs.readdirSync(startPath)
        .map(x => {
            if (!x.includes('.')) {
                return fetchDoc(path.join(startPath, x));
            } else {
                return require(path.join(startPath, x));
            }
        })
}

const rootDir = () => {
    return path.join(__dirname, 'src');
}

console.log(fetchDoc(path.join(rootDir(), 'docs'))) */
// console.log(__dirname);

// console.log(fs.readdirSync(path.join('src')));

// console.log(new Date().toDateString())