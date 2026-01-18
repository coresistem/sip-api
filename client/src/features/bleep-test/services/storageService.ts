import { TestReport } from '../types';
import { api } from '../../../context/AuthContext';

const STORAGE_KEY = 'bleep_test_sessions';

export const saveSession = async (session: TestReport) => {
    try {
        // Save locally
        const existing = localStorage.getItem(STORAGE_KEY);
        const sessions: TestReport[] = existing ? JSON.parse(existing) : [];
        sessions.push(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

        // Sync to Server
        try {
            await api.post('/analytics/bleep-test', {
                date: session.participant.testDate,
                level: session.level,
                shuttle: session.shuttle,
                vo2Max: session.vo2Max
            });
        } catch (serverError) {
            console.error('Failed to sync bleep test to server', serverError);
            // We still return true if local save worked, but maybe warn?
        }

        return true;
    } catch (e) {
        console.error("Failed to save session", e);
        return false;
    }
};

export const getSessions = (): TestReport[] => {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        return [];
    }
};

export const getSessionById = (id: string): TestReport | undefined => {
    const sessions = getSessions();
    return sessions.find(s => s.id === id);
};
