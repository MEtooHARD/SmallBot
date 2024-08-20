import { ConnectionEvents, on } from "../../mongoose";

const close = () => on(ConnectionEvents.close, () => {
  console.log('[mongoose] close');
});

export = close;
