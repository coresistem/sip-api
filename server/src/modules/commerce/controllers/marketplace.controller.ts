import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

// ===========================================
// PRODUCT MANAGEMENT
// ===========================================

// GET /api/v1/marketplace/products - List products
export const listProducts = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const where: any = {};
        if (category && category !== 'All') {
            where.category = category;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ success: false, message: 'Failed to list products' });
    }
};

// GET /api/v1/marketplace/products/:id - Get product details
export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to get product' });
    }
};

// ===========================================
// CART MANAGEMENT
// ===========================================

// GET /api/v1/marketplace/cart - Get user cart
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart) {
            // Create empty cart if not exists
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to get cart' });
    }
};

// POST /api/v1/marketplace/cart - Add item to cart
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId, quantity = 1, size } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'ProductId is required' });
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId: userId! } });
        }

        // Check if item already exists in cart with same size
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                size: size || null
            }
        });

        if (existingItem) {
            // Update quantity
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
                include: { product: true }
            });
            return res.json({ success: true, data: updatedItem });
        }

        // Add new item
        const newItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                size
            },
            include: { product: true }
        });

        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to add to cart' });
    }
};

// PUT /api/v1/marketplace/cart/:itemId - Update cart item
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            await prisma.cartItem.delete({ where: { id: itemId } });
            return res.json({ success: true, message: 'Item removed from cart' });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: { product: true }
        });

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart item' });
    }
};

// DELETE /api/v1/marketplace/cart/:itemId - Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        await prisma.cartItem.delete({ where: { id: itemId } });
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
    }
};

// ===========================================
// ORDER MANAGEMENT
// ===========================================

// POST /api/v1/marketplace/orders - Create order from cart
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { address, paymentMethod } = req.body;

        // Get cart with items
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Calculate total
        const totalAmount = cart.items.reduce((acc, item) => {
            return acc + (item.product.price * item.quantity);
        }, 0);

        // Generate order number
        const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order in transaction
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create order
            const newOrder = await tx.order.create({
                data: {
                    orderNo,
                    userId: userId!,
                    totalAmount,
                    address,
                    paymentMethod,
                    status: 'PENDING',
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price, // Snap-shot price
                            size: item.size
                        }))
                    }
                },
                include: { items: { include: { product: true } } }
            });

            // 2. Clear cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// GET /api/v1/marketplace/orders - List user orders
export const listOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to list orders' });
    }
};

// GET /api/v1/marketplace/orders/:id - Get order details
export const getOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: { select: { name: true, email: true } }
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to get order' });
    }
};
