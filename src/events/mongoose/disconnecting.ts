import { ConnectionStates } from "mongoose";
import { ConnectionEvents, connectionStatus, on } from "../../mongoose";
import chalk from "chalk";

const disconnecting = () => on(ConnectionEvents.disconnecting, () => {
    console.log('[mongoose] ' + chalk.yellow('disconnecting'));
    connectionStatus.setConnection(ConnectionStates.disconnecting);
});

export = disconnecting;