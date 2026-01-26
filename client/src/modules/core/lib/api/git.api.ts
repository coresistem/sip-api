import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
        const response = await axios.get(`${API_URL}/git/history`, {
            params: { limit },
            withCredentials: true
        });
        return response.data;
    },

    restore: async (hash: string) => {
        const response = await axios.post(`${API_URL}/git/restore`, { hash }, {
            withCredentials: true
        });
        return response.data;
    }
};
