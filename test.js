
const trimStringStartArr = (str, key) => {
    let match;
    key = key.filter(c => c.length);
    while (match = key.find(c => str.substring(0, c.length) === c)) {
        str = str.substring(match.length);
    }
    return str;
}

const trimStringEnd = (str, key) => {
    let match
    while(match = key.find(c => str.substring(str.length - c.length) === c)) 
        str = str.substring(0, str.length - match.length);
    
    return str;
}

const trimString = (str, key) => {
    return trimStringEnd(trimStringStartArr(str, key), key);
}

console.log(trimString('ghhgg..', ['.', 'h']));