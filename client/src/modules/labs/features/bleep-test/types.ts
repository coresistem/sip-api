export interface Participant {
    id: string;
    fullName: string;
    age: number;
    gender: 'male' | 'female';
    height?: number;
    weight?: number;
    notes?: string;
    testDate: string;
    assessorName?: string;
}

export interface LevelData {
    level: number;
    shuttles: number;
    speed: number; // km/h
    timePerShuttle: number; // seconds
    levelDistance: number; // meters
    accumulatedDistance: number; // meters
    accumulatedTime: number; // seconds (start of level)
}

export interface TestSession {
    id: string;
    participantId: string;
    level: number;
    shuttle: number;
    totalDistance: number;
    totalTime: number; // seconds
    maxSpeed: number;
    vo2Max: number;
    status: 'IDLE' | 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
    history: { level: number; speed: number; heartRate?: number }[];
}

export interface TestReport extends TestSession {
    participant: Participant;
    fitnessCategory: string;
}
