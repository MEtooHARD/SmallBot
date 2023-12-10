const trimStringStart = (str: string, key: string[]) => {
    let match: string | undefined;
    while (match = key.find(c => str.substring(0, c.length) === c))
        str = str.substring(match.length);

    return str;
}

const trimStringEnd = (str: string, key: string[]) => {
    let match: string | undefined;
    while (match = key.find(c => str.substring(str.length - c.length) === c))
        str = str.substring(0, str.length - match.length);
    return str;
}

const trimString = (str: string, char: string[]) => {
    return trimStringEnd(trimStringStart(str, char), char);
}

export {
    trimStringStart,
    trimStringEnd,
    trimString,
}