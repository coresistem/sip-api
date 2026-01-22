import { api } from '../../context/AuthContext';

export interface Asset {
    id: string;
    clubId: string;
    itemName: string;
    category: string;
    brand?: string;
    model?: string;
    quantity?: number;
    serialNumber?: string;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    conditionNotes?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    supplier?: string;
    warrantyExpiry?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    maintenanceCycle?: number;
    storageLocation?: string;
    assignedTo?: string;
    imageUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AssetCategory {
    id: string;
    clubId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssetDTO {
    itemName: string;
    category: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    status?: string;
    condition?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    supplier?: string;
    warrantyExpiry?: string;
    maintenanceCycle?: number;
    storageLocation?: string;
    assignedTo?: string;
    imageUrl?: string;
    notes?: string;
    // Merged UI fields
    brandModel?: string;
    quantity?: number;
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> { }

export interface InventoryStats {
    byStatus: { status: string; _count: number }[];
    byCategory: { category: string; _count: number }[];
    needsMaintenance: number;
}

export const inventoryApi = {
    getInventory: async (params?: {
        category?: string;
        status?: string;
        condition?: string;
        search?: string;
        page?: number;
        limit?: number
    }) => {
        const response = await api.get('/inventory', { params });
        return response.data;
    },

    createAsset: async (data: CreateAssetDTO) => {
        const response = await api.post('/inventory', data);
        return response.data;
    },

    updateAsset: async (id: string, data: UpdateAssetDTO) => {
        const response = await api.put(`/inventory/${id}`, data);
        return response.data;
    },

    deleteAsset: async (id: string) => {
        const response = await api.delete(`/inventory/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/inventory/stats');
        return response.data;
    },

    // Category API
    getCategories: async () => {
        const response = await api.get('/inventory/categories');
        return response.data;
    },

    createCategory: async (name: string) => {
        const response = await api.post('/inventory/categories', { name });
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await api.delete(`/inventory/categories/${id}`);
        return response.data;
    }
};
