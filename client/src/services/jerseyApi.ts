import { api } from '../context/AuthContext';

// ===========================================
// TYPES
// ===========================================

export interface ProductVariant {
    id: string;
    productId: string;
    category: string; // SIZE, NECK, SLEEVE, ADDON
    name: string;
    priceModifier: number;
    isDefault: boolean;
    sortOrder: number;
}

export interface JerseyProduct {
    id: string;
    supplierId: string;
    supplierName?: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    designUrl?: string;
    designThumbnail?: string;
    basePrice: number;
    currency: string;
    isActive: boolean;
    minOrderQty: number;
    visibility: 'PUBLIC' | 'CLUBS_ONLY' | 'SPECIFIC';
    allowedClubIds?: string;
    createdAt: string;
    updatedAt: string;
    variants: ProductVariant[];
    variantsByCategory?: Record<string, ProductVariant[]>;
    ordersCount?: number;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product?: { name: string; designUrl?: string; designThumbnail?: string };
    recipientName: string;
    athleteId?: string;
    quantity: number;
    basePrice: number;
    selectedVariants?: Record<string, string>;
    variantPrices: number;
    lineTotal: number;
    nameOnJersey?: string;
    numberOnJersey?: string;
}

export interface OrderTracking {
    id: string;
    orderId: string;
    status: string;
    description?: string;
    updatedBy: string;
    createdAt: string;
}

export interface CourierInfo {
    id: string;
    orderId: string;
    courierName: string;
    awbNumber: string;
    trackingUrl?: string;
    shippingCost?: number;
    estimatedDelivery?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JerseyOrder {
    id: string;
    orderNo: string;
    customerId: string;
    clubId?: string;
    orderType: 'INDIVIDUAL' | 'COLLECTIVE';
    supplierId: string;
    subtotal: number;
    addonsTotal: number;
    totalAmount: number;
    currency: string;
    status: 'PENDING' | 'CONFIRMED' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED' | 'REFUNDED';
    paymentProofUrl?: string;
    notes?: string;
    shippingAddress?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    tracking: OrderTracking[];
    courierInfo?: CourierInfo;
    itemCount?: number;
    latestStatus?: string;
}

export interface CreateProductData {
    name: string;
    sku: string;
    category: string;
    description?: string;
    designUrl?: string;
    designThumbnail?: string;
    basePrice: number;
    minOrderQty?: number;
    visibility?: 'PUBLIC' | 'CLUBS_ONLY' | 'SPECIFIC';
    variants?: Omit<ProductVariant, 'id' | 'productId' | 'sortOrder'>[];
}

export interface CartItem {
    productId: string;
    selectedVariants?: Record<string, string>;
    quantity: number;
    recipientName?: string;
    athleteId?: string;
    nameOnJersey?: string;
    numberOnJersey?: string;
}

export interface CalculatedItem {
    productId: string;
    productName: string;
    basePrice: number;
    selectedVariants: { category: string; name: string; price: number }[];
    variantPrices: number;
    quantity: number;
    lineTotal: number;
}

export interface OrderCalculation {
    items: CalculatedItem[];
    subtotal: number;
    addonsTotal: number;
    totalAmount: number;
}

export interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
}

export interface JerseyCustomer {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
    totalOrders?: number; // From stats
    totalSpent?: number;  // From stats
    lastOrderDate?: string; // From stats
}

export interface CustomerDetailData {
    profile: JerseyCustomer;
    orders: JerseyOrder[];
}

export interface InventoryAlert {
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    designThumbnail?: string;
}

export interface SalesAnalyticsData {
    date: string;
    total: number;
}

export interface TopProductData {
    name: string;
    quantity: number;
    revenue: number;
    thumbnail?: string;
}

// ===========================================
// PRODUCT API
// ===========================================

export const listProducts = async (filters?: { supplierId?: string; active?: boolean }): Promise<JerseyProduct[]> => {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    const response = await api.get(`/jersey/products?${params.toString()}`);
    return response.data.data;
};

export const getProduct = async (id: string): Promise<JerseyProduct> => {
    const response = await api.get(`/jersey/products/${id}`);
    return response.data.data;
};

export const createProduct = async (data: CreateProductData): Promise<JerseyProduct> => {
    const response = await api.post('/jersey/products', data);
    return response.data.data;
};

export const updateProduct = async (id: string, data: Partial<CreateProductData & { isActive: boolean }>): Promise<JerseyProduct> => {
    const response = await api.put(`/jersey/products/${id}`, data);
    return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await api.delete(`/jersey/products/${id}`);
};

// ===========================================
// VARIANT API
// ===========================================

export const addVariant = async (productId: string, data: Omit<ProductVariant, 'id' | 'productId' | 'sortOrder'>): Promise<ProductVariant> => {
    const response = await api.post(`/jersey/products/${productId}/variants`, data);
    return response.data.data;
};

export const updateVariant = async (id: string, data: Partial<ProductVariant>): Promise<ProductVariant> => {
    const response = await api.put(`/jersey/variants/${id}`, data);
    return response.data.data;
};

export const deleteVariant = async (id: string): Promise<void> => {
    await api.delete(`/jersey/variants/${id}`);
};

// ===========================================
// ORDER API
// ===========================================

export const calculateOrderTotal = async (items: CartItem[]): Promise<OrderCalculation> => {
    const response = await api.post('/jersey/orders/calculate', { items });
    return response.data.data;
};

export const createOrder = async (data: {
    supplierId: string;
    items: CartItem[];
    orderType?: 'INDIVIDUAL' | 'COLLECTIVE';
    clubId?: string;
    notes?: string;
    shippingAddress?: string;
}): Promise<JerseyOrder> => {
    const response = await api.post('/jersey/orders', data);
    return response.data.data;
};

export const listOrders = async (filters?: { status?: string; limit?: number }): Promise<JerseyOrder[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/jersey/orders?${params.toString()}`);
    return response.data.data;
};

export const getOrder = async (id: string): Promise<JerseyOrder> => {
    const response = await api.get(`/jersey/orders/${id}`);
    return response.data.data;
};

export const updateOrderStatus = async (id: string, data: { status: string; paymentStatus?: string; description?: string }): Promise<JerseyOrder> => {
    const response = await api.put(`/jersey/orders/${id}/status`, data);
    return response.data.data;
};

export const cancelOrder = async (id: string, reason?: string): Promise<JerseyOrder> => {
    const response = await api.post(`/jersey/orders/${id}/cancel`, { reason });
    return response.data.data;
};

export const uploadPaymentProof = async (id: string, paymentProofUrl: string): Promise<JerseyOrder> => {
    const response = await api.post(`/jersey/orders/${id}/payment-proof`, { paymentProofUrl });
    return response.data.data;
};

export const verifyPayment = async (id: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string): Promise<JerseyOrder> => {
    const response = await api.post(`/jersey/orders/${id}/verify-payment`, { action, rejectionReason });
    return response.data.data;
};

// ===========================================
// ANALYTICS API
// ===========================================

export const getSalesAnalytics = async (period: number = 30): Promise<SalesAnalyticsData[]> => {
    const response = await api.get(`/jersey/analytics/sales?period=${period}`);
    return response.data.data;
};

export const getTopProducts = async (limit: number = 5): Promise<TopProductData[]> => {
    const response = await api.get(`/jersey/analytics/top-products?limit=${limit}`);
    return response.data.data;
};

// ===========================================
// CUSTOMER API
// ===========================================

export const getCustomerList = async (): Promise<JerseyCustomer[]> => {
    const response = await api.get('/jersey/customers');
    return response.data.data;
};

export const getCustomerDetails = async (id: string): Promise<CustomerDetailData> => {
    const response = await api.get(`/jersey/customers/${id}`);
    return response.data.data;
};

export const getInventoryAlerts = async (): Promise<InventoryAlert[]> => {
    const response = await api.get('/jersey/inventory/alerts');
    return response.data.data;
};

// ===========================================
// HELPERS
// ===========================================

export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const ORDER_STATUSES = [
    { value: 'PENDING', label: 'Menunggu Konfirmasi', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Dikonfirmasi', color: 'blue' },
    { value: 'PRODUCTION', label: 'Dalam Produksi', color: 'purple' },
    { value: 'SHIPPED', label: 'Dikirim', color: 'cyan' },
    { value: 'DELIVERED', label: 'Terkirim', color: 'green' },
    { value: 'CANCELLED', label: 'Dibatalkan', color: 'red' }
];

export const PAYMENT_STATUSES = [
    { value: 'UNPAID', label: 'Belum Bayar', color: 'red' },
    { value: 'PENDING_VERIFICATION', label: 'Menunggu Verifikasi', color: 'yellow' },
    { value: 'PAID', label: 'Lunas', color: 'green' },
    { value: 'REJECTED', label: 'Ditolak', color: 'red' },
    { value: 'REFUNDED', label: 'Dikembalikan', color: 'gray' }
];

export const VARIANT_CATEGORIES = [
    { id: 'SIZE', label: 'Ukuran', icon: 'Ruler' },
    { id: 'NECK', label: 'Kerah', icon: 'Shirt' },
    { id: 'SLEEVE', label: 'Lengan', icon: 'Layers' },
    { id: 'ADDON', label: 'Tambahan', icon: 'Plus' }
];

// ===========================================
// IMAGE UPLOAD
// ===========================================

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data.data.url;
};
