import fs from 'node:fs';
import path from 'node:path';

class Doc {
    /**
     * The name of this Doc, also as the begin path of this Doc.
     */
    name: string;
    /**
     * The paths after base. At the very begining will be set as an array contain the `name` of this Doc.
     */
    paths: string[];
    /**
     * The base path of Doc, which is the start place. Here is from the `docs` folder.
     */
    readonly base = [__dirname, '..', 'docs'];

    /**
     * Whether this Doc now reached the end of the folders.
     */
    get end() {
        return Boolean(this.childs.length);
    }
    /**
     * The absolute path of the folder this Doc is in now.
     */
    get absPath() {
        return path.join(...this.base, ...this.paths);
    }
    /**
     * Childs are which the directories, under the folder this Doc is now in, containing a js file named as same as the directory itself.
     */
    get childs(): fs.Dirent[] {
        return fs.readdirSync(this.absPath, { withFileTypes: true })
            .filter(dirent =>
                dirent.isDirectory()
                &&
                fs.existsSync(path.join(this.absPath, dirent.name, dirent.name.concat('.js'))));
    }
    /**
     * The embed of the selected folder.
     */
    get embed() {
        return require(this.absPath + '/' + this.paths.slice(-1))();
    }

    constructor(name: string) {
        this.name = name;
        this.paths = [this.name];
    }
    /**
     * Sets the next child to go.
     * @param togo the selected child.
     */
    goto(togo: string) {
        this.paths.push(togo);
    }
    /**
     * Back a step to the upper folder.
     */
    back() {
        this.paths.pop();
    }
    /**
     * Set as the position where this Doc is initialized to.
     */
    home() {
        this.paths = [this.name];
    }
}

export = Doc;