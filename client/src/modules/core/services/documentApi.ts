import { api } from '@/modules/core/contexts/AuthContext';

export interface GeneralDocument {
    id: string;
    coreId: string;
    title: string;
    description?: string;
    category: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedById?: string;
    isPublic: boolean;
    expiryDate?: string;
    createdAt: string;
    updatedAt: string;
}

export const documentApi = {
    // Get documents by CORE ID
    getByCoreId: async (coreId: string) => {
        const response = await api.get<GeneralDocument[]>(`/documents/${coreId}`);
        return response.data;
    },

    // Upload one file
    upload: async (file: File, coreId: string, title?: string, uploadedBy?: string, uploadedById?: string, category?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('coreId', coreId);
        if (title) formData.append('title', title);
        if (uploadedBy) formData.append('uploadedBy', uploadedBy);
        if (uploadedById) formData.append('uploadedById', uploadedById);
        if (category) formData.append('category', category);

        const response = await api.post<GeneralDocument>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Rename
    rename: async (id: string, title: string) => {
        const response = await api.post<GeneralDocument>(`/documents/${id}/rename`, { title });
        return response.data;
    },

    // Delete
    delete: async (id: string) => {
        await api.delete(`/documents/${id}`);
    }
};
