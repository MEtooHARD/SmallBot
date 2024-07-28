import rootPath from "get-root-path";
import { Docor } from "./classes/Docor";
import path from 'node:path';

export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');