import { ConnectionEvents, on } from "../../mongoose";

const open = () => on(ConnectionEvents.open, () => {
  console.log('[mongoose] open');
});

export = open;