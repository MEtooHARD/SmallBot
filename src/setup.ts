import { CM, should_deploy_command } from "./app";
import { loadHelpCenter, loadSlashCommand, onDiscordEvents, onMongoDBEvents } from "./load";
import { unknownError } from "./events/other/unknowError";

const setup = async () => {
    unknownError();
    loadHelpCenter();
    loadSlashCommand();
    onDiscordEvents();
    onMongoDBEvents();
    if (should_deploy_command) await CM.registerAllCommands();
};

export = setup;