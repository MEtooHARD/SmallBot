import { shouldDeployCommand } from "./app";
import { SCM, loadHelpCenter, loadSlashCommand } from "./data";
import { unknownError } from "./events/other/unknowError";

const setup = async () => {
    unknownError();
    loadHelpCenter();
    loadSlashCommand();
    if (shouldDeployCommand) await SCM.registerAllCommands();
};

export = setup;