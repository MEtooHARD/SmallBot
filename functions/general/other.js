

/*
* no functions should be imported in this file
*/

// return a random integer with the predefined range
const randomInt = (min, max) => Math.floor((max - min + 1) * Math.random()) + min

// return an array with consecutive integers starting from 0 to provided integer
const posRange = end => Array.from(Array(end).keys()).map(x => x)

module.exports = {
    randomInt: randomInt,
    posRange: posRange,
}
