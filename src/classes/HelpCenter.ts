import path from 'node:path';
import fs from 'node:fs';
import { NestedArray } from './NestedArray';
import { EmbedData } from 'discord.js';

class HelpCenter {

    static serviceName = 'Small Bot Help Center';

    static docRoot = 'docs';

    static docDirs = (paths: string[]): NestedArray<string | EmbedData> => {
        return fs.readdirSync(path.join(...paths)).map(x => {
            if (!x.includes('.')) {
                return this.docDirs([...paths, x]);
            } else {
                return require(path.join('..', ...paths, x))();
            }
        })
    }

    static fetchDoc = (path: string) => {
        return require(path);
    }
}

export = HelpCenter;