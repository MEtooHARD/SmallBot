import { ConnectionStates, connect, connection } from "mongoose";

export const connectMongoDB = async (username: string, password: string, serial: string): Promise<void> => {
    await connect(`mongodb+srv://${username}:${password}@servicedata.${serial}.mongodb.net/?retryWrites=true&w=majority&appName=ServiceData`);
};

export const connectionStatus = new class ConnectionStatus {
    connectionState: ConnectionStates = ConnectionStates.uninitialized;
    setConnection = (state: ConnectionStates) => this.connectionState = state;
};

export enum ConnectionEvents {
    connected = 'connected',
    open = 'open',
    disconnected = 'disconnected',
    reconnected = 'reconnected',
    disconnecting = 'disconnecting',
    close = 'close'
};

export const on = (event: ConnectionEvents, callback = () => { }) => {
    connection.on(event, callback);
    console.log('[mongoose] on ' + event);
};
