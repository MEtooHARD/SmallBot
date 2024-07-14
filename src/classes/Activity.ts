export interface Activity {
    createdAt: number;
    createdBy: string; // Snowflake (user)
    startTime: number;
    duration: number;
    global: boolean;
    closed: boolean;
};

export enum ActivityStage {
    BASICSETTING = 'BASICSETTING',
    PREPARING = 'PREPARING',
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
};