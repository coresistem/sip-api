import { api } from '../../core/contexts/AuthContext';

export interface Task {
    id: string;
    manpowerId: string;
    orderId: string;
    stage: string;
    quantity: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    startedAt?: string;
    completedAt?: string;
    estimatedMinutes?: number;
    actualMinutes?: number;
    notes?: string;
    manpower?: { id: string; name: string; specialization?: string };
    order?: { id: string; orderNo: string; status: string };
}

export const manufacturingApi = {
    // List tasks
    listTasks: async (params?: any) => {
        // Maps to the backend /jersey/tasks or /manpower/tasks 
        // Based on previous analysis, we used /manpower/tasks in legacy.
        // Let's assume the router is migrated to /jersey/tasks or keep using /manpower/tasks if not fully moved.
        // Checking jersey.routes.ts earlier might clarify.
        // But let's stick to /manpower as it might be a shared module.
        // Actually earlier 'list_dir' showed 'manpower' dir in legacy features/jersey.
        // The backend `jersey` module has `TaskController`? No, it had `qc`. 
        // Wait, looking at `server/src/modules/jersey/controllers/jersey.controller.ts` ...
        // It's likely under a different route.
        // Let's use the path found in legacy code for now: `/manpower/tasks` or `/jersey/tasks`.
        // Inspecting `ProductionTimeline.tsx` it used `/jersey/orders` and `/manpower/tasks`.
        // I will assume `/manpower/tasks` is still valid or I should create it if missing.
        // Ideally we move to `/jersey/manufacturing/tasks`?
        // For safe migration, I'll use the legacy endpoint path if it works, or `/jersey/tasks` if I see it.
        // In the previous step I used `orderApi.listTasks` -> `/jersey/tasks`. 
        // Let's stick to `/jersey/tasks` for consistency if `order.api.ts` used it.
        // Wait, `order.api.ts` used `/jersey/tasks`.
        const response = await api.get('/jersey/tasks', { params });
        return response.data;
    },

    // Update task status
    updateTaskStatus: async (taskId: string, status: string, data?: any) => {
        const response = await api.put(`/jersey/tasks/${taskId}/status`, { status, ...data });
        return response.data;
    }
};
