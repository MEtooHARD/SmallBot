import { trimStringEnd } from "./string";
import { readdirSync } from 'node:fs';
import path from 'node:path';
import fs from 'node:fs';

export const getDirectories = (dir: string, forImport: boolean = false, nest: boolean = false) => {
  let result: string[] = [];
  dir = trimStringEnd(dir, ['/']);
  readdirSync(dir, { withFileTypes: true }).map(x => {
    if (x.isDirectory()) result =
      nest ?
        [...result, ...getDirectories(dir + '/' + x.name, forImport)]
        :
        result;
    else result.push(dir + '/' + (forImport && x.name.slice(-3) === '.js' ? x.name.slice(0, -3) : x.name));
  });
  return result;
}

export const picPath = (name: string): string => {
  return path.join(__dirname, '..', '..', '..', 'media', 'pic', name);
}