import { trimString } from "../string/trim";
import path from 'node:path';
import fs from 'node:fs';

const getSvcInfo = (str: string): string[] => {
    const result = str.match(RegExp(/\[\w+\]/, 'g'));
    return result ? result.map(s => trimString(s, ['[', ']'])) : [];
}

const getSvcDir = (dir: string, target: string): string => {
    let resultDir: string[];
    try {
        resultDir = fs.readdirSync(dir);
    } catch (e) {
        console.log(e);
        return '';
    }
    const result = resultDir.filter(x => x === target.concat('.js'))
    return result.length ? path.join(dir, result[0]) : '';
}

export {
    getSvcInfo,
    getSvcDir
}