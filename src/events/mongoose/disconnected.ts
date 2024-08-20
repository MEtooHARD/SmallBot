import { ConnectionStates } from "mongoose";
import { ConnectionEvents, connectionStatus, on } from "../../mongoose";
import chalk from "chalk";

const disconnected = () => on(ConnectionEvents.disconnected, () => {
    console.log('[mongoose] ' + chalk.red('disconnected'));
    connectionStatus.setConnection(ConnectionStates.disconnected);
});

export = disconnected;