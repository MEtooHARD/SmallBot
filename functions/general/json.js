
/*
* no functions should be imported in this file
*/

const stringify = obj => JSON.stringify(obj)
const parse = str => JSON.parse(str)

module.exports = {
    stringify: stringify,
    parse: parse,
}
