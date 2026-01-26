import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import marketplaceService, { Cart, CartItem, Product } from '../services/marketplaceService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface CartContextType {
    cart: Cart | null;
    items: CartItem[];
    loading: boolean;
    addItem: (productId: string, quantity?: number, size?: string) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCart(null);
            return;
        }

        try {
            setLoading(true);
            const response = await marketplaceService.getCart();
            if (response.success) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Refresh cart error:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addItem = async (productId: string, quantity: number = 1, size?: string) => {
        if (!user) {
            toast.error('Harap login untuk menambah item ke keranjang');
            return;
        }

        try {
            const response = await marketplaceService.addToCart(productId, quantity, size);
            if (response.success) {
                await refreshCart();
                toast.success('Item ditambahkan ke keranjang');
            }
        } catch (error) {
            console.error('Add item error:', error);
            toast.error('Gagal menambahkan item');
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const response = await marketplaceService.removeFromCart(itemId);
            if (response.success) {
                await refreshCart();
                toast.success('Item dihapus');
            }
        } catch (error) {
            console.error('Remove item error:', error);
            toast.error('Gagal menghapus item');
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        try {
            const response = await marketplaceService.updateCartItem(itemId, quantity);
            if (response.success) {
                await refreshCart();
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            toast.error('Gagal memperbarui jumlah');
        }
    };

    const clearCart = () => {
        setCart(null);
    };

    const items = useMemo(() => cart?.items || [], [cart]);

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }, [items]);

    const itemCount = useMemo(() => {
        return items.reduce((count, item) => count + item.quantity, 0);
    }, [items]);

    return (
        <CartContext.Provider value={{
            cart,
            items,
            loading,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalAmount,
            itemCount,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
