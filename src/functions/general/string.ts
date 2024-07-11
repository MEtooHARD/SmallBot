export const trimStringStart = (str: string, key: string[]) => {
    let match: string | undefined;
    while (match = key.find(c => str.substring(0, c.length) === c))
        str = str.substring(match.length);

    return str;
};

export const trimStringEnd = (str: string, key: string[]) => {
    let match: string | undefined;
    while (match = key.find(c => str.substring(str.length - c.length) === c))
        str = str.substring(0, str.length - match.length);
    return str;
};

export const trimString = (str: string, char: string[]) => {
    return trimStringEnd(trimStringStart(str, char), char);
};

export const x_min_y_sec = (milli: number): string => {
    const seconds = Math.round(milli / 1000);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    if (min > 0) return `${min} min ${sec} sec`;
    return `${sec} sec`;
};
