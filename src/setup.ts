import { shouldDeployCommand } from "./app";
import { CM, loadHelpCenter, loadSlashCommand } from "./data";
import { unknownError } from "./events/other/unknowError";

const setup = async () => {
  unknownError();
  loadHelpCenter();
  loadSlashCommand();
  if (shouldDeployCommand) await CM.registerAllCommands();
};

export = setup;