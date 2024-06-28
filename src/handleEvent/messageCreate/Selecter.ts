import { Message } from "discord.js";
import { MessageCommand, MessageFeature } from "../../classes/MessageFeature";
import { prefix } from "../../app";
import fs from "node:fs";
import path from "node:path";
import { getCmdInfo } from "../../functions/discord/msgCommand";
import { randomPick } from "../../functions/general/array";
import chalk from "chalk";
import { logMsgCommand, logMsgFeature } from "../../functions/general/log";

export = new class Selecter extends MessageFeature {
    filter = (message: Message<boolean>): boolean => { return true; };
    exe = async (message: Message<boolean>): Promise<void> => {
        if (message.content.startsWith(prefix)) {
            const [command, ...param] = getCmdInfo(message.content);
            if (fs.readdirSync(path.join(__dirname, "commands"))
                .filter(name => name.endsWith('.js'))
                .map(name => name.slice(0, name.length - 3))
                .includes(command)) { // check command
                const executor = require(path.join(__dirname, "commands", command)) as MessageCommand;
                if (executor.filter(message, param)) {
                    logMsgCommand(message, command);
                    await executor.exe(message, param); // execute
                }
            }
        } else {
            const features = fs.readdirSync(path.join(__dirname, "features"))
                .filter(name => name.endsWith(".js"));

            const temp = Object.keys(features);

            for (let i = 0; i < features.length; i++) {
                const featureName = features[Number(randomPick(temp, 1, true)[0])];
                logMsgFeature(message, featureName);
                const feature = require(path.join(__dirname, "features", featureName)) as MessageFeature;
                if (feature.filter(message)) {
                    await feature.exe(message);
                    break;
                }
            }
        }
    };
}