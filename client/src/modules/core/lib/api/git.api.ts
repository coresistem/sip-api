import { api } from '../../contexts/AuthContext';

export interface CommitInfo {
    hash: string;
    shortHash: string;
    author: string;
    date: string;
    message: string;
    isCurrent: boolean;
}

export const gitApi = {
    getHistory: async (limit: number = 20) => {
        const response = await api.get('/git/history', {
            params: { limit }
        });
        return response.data;
    },

    restore: async (hash: string) => {
        const response = await api.post('/git/restore', { hash });
        return response.data;
    }
};
