import { api } from '../../core/contexts/AuthContext';

export const analyticsApi = {
    getSalesAnalytics: async (period: string = 'monthly') => {
        const response = await api.get('/jersey/analytics/sales', { params: { period } });
        return response.data;
    },
    getTopProducts: async () => {
        const response = await api.get('/jersey/analytics/top-products');
        return response.data;
    },
    getInventoryAlerts: async () => {
        const response = await api.get('/jersey/inventory/alerts');
        return response.data;
    }
};
