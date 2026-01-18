import { TestReport } from '../types';

const STORAGE_KEY = 'bleep_test_sessions';

export const saveSession = (session: TestReport) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const sessions: TestReport[] = existing ? JSON.parse(existing) : [];
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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
