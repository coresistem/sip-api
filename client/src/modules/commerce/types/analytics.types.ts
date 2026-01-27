export interface SalesAnalyticsData {
    date: string;
    total: number;
    count: number;
}

export interface TopProductData {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    revenue: number;
    quantity: number;
    category?: string;
    variants?: any[];
}

export interface InventoryAlert {
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    designThumbnail?: string;
}
