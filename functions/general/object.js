

const { stringify, parse } = require('./json')
/*
* no functions (except from json.js) should be imported in this file
*/


// return a deep copy of the object
const deepCopy = obj => parse(stringify(obj))

// get keys in object, return as array
const getObjectKeys = obj => Object.keys(obj)

// get values in object, return as array
const getObjectValues = obj => Object.values(obj)

// check if an object is empty
const isEmptyObject = obj => (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype)


module.exports = {
    deepCopy: deepCopy,
    getObjectKeys: getObjectKeys,
    getObjectValues: getObjectValues,
    isEmptyObject: isEmptyObject,
}
