import { api } from '../../core/contexts/AuthContext';

export interface ProductVariant {
    id: string;
    productId: string;
    category: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
    sortOrder: number;
}

export interface Product {
    id: string;
    supplierId: string;
    supplierName?: string; // Mapped from backend
    name: string;
    sku: string;
    category: string;
    description: string;
    designUrl?: string; // Main image
    designThumbnail?: string;
    basePrice: number;
    minOrderQty: number;
    isActive: boolean;
    isExclusive: boolean;
    allowedClubIds?: string;
    visibility: 'PUBLIC' | 'CLUBS_ONLY' | 'SPECIFIC' | 'HIDDEN';
    rating?: number; // Optional on frontend
    variants: ProductVariant[];
    variantsByCategory?: Record<string, ProductVariant[]>; // Helper from backend
    ordersCount?: number;
    stock?: number;
    lowStockThreshold?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CatalogResponse {
    success: boolean;
    data: Product[];
    message?: string;
}

export interface ProductDetailResponse {
    success: boolean;
    data: Product;
    message?: string;
}

export const catalogApi = {
    // List all visible products
    listProducts: async (params?: { supplierId?: string; active?: boolean }) => {
        const response = await api.get<CatalogResponse>('/jersey/products', { params });
        return response.data;
    },

    // Get single product details
    getProduct: async (id: string) => {
        const response = await api.get<ProductDetailResponse>(`/jersey/products/${id}`);
        return response.data;
    },

    // Create a new product (Supplier/Admin only)
    createProduct: async (data: any) => {
        const response = await api.post('/jersey/products', data);
        return response.data;
    },

    // Update product (Supplier/Admin only)
    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/jersey/products/${id}`, data);
        return response.data;
    },

    // Delete/Deactivate product
    deleteProduct: async (id: string) => {
        const response = await api.delete(`/jersey/products/${id}`);
        return response.data;
    }
};
