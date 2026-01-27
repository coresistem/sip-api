import { api } from '../../core/contexts/AuthContext';

export interface OrderItem {
    id: string;
    product?: { name: string };
    quantity: number;
    recipientName: string;
}

export interface Order {
    id: string;
    orderNo: string;
    status: 'PENDING' | 'CONFIRMED' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    itemCount?: number;
}

export interface ManpowerTask {
    id: string;
    manpower: { name: string; specialization: string };
    order: { orderNo: string };
    stage: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
    startedAt?: string;
    completedAt?: string;
    estimatedMinutes: number;
}

export const orderApi = {
    // List orders with filtering
    listOrders: async (params?: any) => {
        const response = await api.get('/jersey/orders', { params });
        return response.data;
    },

    // Get tasks (for timeline)
    listTasks: async () => {
        const response = await api.get('/jersey/tasks'); // Fixed path from legacy /manpower/tasks if needed, mapped to jersey route
        // Checking jersey.routes.ts... router.get('/tasks', ... jerseyController.listTasks)
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id: string, status: string) => {
        const response = await api.put(`/jersey/orders/${id}/status`, { status });
        return response.data;
    }
};
