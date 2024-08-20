import { ConnectionStates } from "mongoose";
import { ConnectionEvents, connectionStatus, on } from "../../mongoose";

const reconnected = () => on(ConnectionEvents.reconnected, () => {
  console.log('[mongoose] reconnected');
  // connectionStatus.setConnection(ConnectionStates.connected);
});

export = reconnected;