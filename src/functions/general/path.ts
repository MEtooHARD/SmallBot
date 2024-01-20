import { trimStringEnd } from "./string";
import { readdirSync } from 'node:fs';

const getDirectories = (dir: string, forImport: boolean = false) => {
    let result: string[] = [];
    dir = trimStringEnd(dir, ['/']);
    readdirSync(dir, { withFileTypes: true }).map(x => {
        if (x.isDirectory()) result = [...result, ...getDirectories(dir + '/' + x.name, forImport)];
        else result.push(dir + '/' + (forImport && x.name.slice(-3) === '.js' ? x.name.slice(0, -3) : x.name));
    });
    return result;
}

export {
    getDirectories,
}