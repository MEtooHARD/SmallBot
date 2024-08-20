import { ConnectionStates } from "mongoose";
import { ConnectionEvents, connectionStatus, on } from "../../mongoose";
import chalk from "chalk";

const connected = () => on(ConnectionEvents.connected, () => {
  console.log('[mongoose] ' + chalk.green('connected'));
  connectionStatus.setConnection(ConnectionStates.connected);
});

export = connected;