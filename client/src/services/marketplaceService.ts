import { api } from '../context/AuthContext';

const API_URL = '/marketplace';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating: number;
    isExclusive: boolean;
}

export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    product: Product;
    quantity: number;
    size?: string;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
}

export interface Order {
    id: string;
    orderNo: string;
    totalAmount: number;
    status: string;
    address?: string;
    createdAt: string;
    items: {
        id: string;
        product: Product;
        quantity: number;
        price: number;
        size?: string;
    }[];
}

const marketplaceService = {
    // Products
    async listProducts(category?: string) {
        const response = await api.get(`${API_URL}/products`, {
            params: { category }
        });
        return response.data;
    },

    async getProduct(id: string) {
        const response = await api.get(`${API_URL}/products/${id}`);
        return response.data;
    },

    // Cart
    async getCart() {
        const response = await api.get(`${API_URL}/cart`);
        return response.data;
    },

    async addToCart(productId: string, quantity: number = 1, size?: string) {
        const response = await api.post(`${API_URL}/cart`, {
            productId,
            quantity,
            size
        });
        return response.data;
    },

    async updateCartItem(itemId: string, quantity: number) {
        const response = await api.put(`${API_URL}/cart/${itemId}`, {
            quantity
        });
        return response.data;
    },

    async removeFromCart(itemId: string) {
        const response = await api.delete(`${API_URL}/cart/${itemId}`);
        return response.data;
    },

    // Orders
    async createOrder(address?: string, paymentMethod?: string) {
        const response = await api.post(`${API_URL}/orders`, {
            address,
            paymentMethod
        });
        return response.data;
    },

    async listOrders() {
        const response = await api.get(`${API_URL}/orders`);
        return response.data;
    },

    async getOrder(id: string) {
        const response = await api.get(`${API_URL}/orders/${id}`);
        return response.data;
    }
};

export default marketplaceService;
