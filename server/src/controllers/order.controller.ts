import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// ===========================================
// ORDER MANAGEMENT
// ===========================================

// Generate order number: JO-YYMMDD-XXX
const generateOrderNo = async (): Promise<string> => {
    const now = new Date();
    const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    // Count today's orders
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const todayCount = await prisma.jerseyOrder.count({
        where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
        }
    });

    return `JO-${dateStr}-${String(todayCount + 1).padStart(3, '0')}`;
};

// POST /api/v1/jersey/orders/calculate - Calculate order total
export const calculateOrderTotal = async (req: Request, res: Response) => {
    try {
        const { items } = req.body;
        // items: [{ productId, selectedVariants: { SIZE: "XL", NECK: "V-neck" }, quantity }]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items array is required' });
        }

        let subtotal = 0;
        let addonsTotal = 0;
        const itemDetails = [];

        for (const item of items) {
            const product = await prisma.jerseyProduct.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });

            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
            }

            let itemAddons = 0;
            const selectedVariantDetails: { category: string; name: string; price: number }[] = [];

            // Calculate variant prices
            if (item.selectedVariants) {
                for (const [category, variantName] of Object.entries(item.selectedVariants)) {
                    const variant = product.variants.find(
                        v => v.category === category && v.name === variantName
                    );
                    if (variant) {
                        itemAddons += variant.priceModifier;
                        selectedVariantDetails.push({
                            category: variant.category,
                            name: variant.name,
                            price: variant.priceModifier
                        });
                    }
                }
            }

            const quantity = item.quantity || 1;
            const lineTotal = (product.basePrice + itemAddons) * quantity;

            subtotal += product.basePrice * quantity;
            addonsTotal += itemAddons * quantity;

            itemDetails.push({
                productId: item.productId,
                productName: product.name,
                basePrice: product.basePrice,
                selectedVariants: selectedVariantDetails,
                variantPrices: itemAddons,
                quantity,
                lineTotal
            });
        }

        res.json({
            success: true,
            data: {
                items: itemDetails,
                subtotal,
                addonsTotal,
                totalAmount: subtotal + addonsTotal
            }
        });
    } catch (error) {
        console.error('Calculate order total error:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate order total' });
    }
};

// POST /api/v1/jersey/orders - Create new order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {
            supplierId, items, orderType, clubId,
            notes, shippingAddress
        } = req.body;

        if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'supplierId and items array are required'
            });
        }

        // Calculate totals
        let subtotal = 0;
        let addonsTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.jerseyProduct.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            let itemAddons = 0;
            if (item.selectedVariants) {
                for (const [category, variantName] of Object.entries(item.selectedVariants)) {
                    const variant = product.variants.find(
                        v => v.category === category && v.name === variantName
                    );
                    if (variant) {
                        itemAddons += variant.priceModifier;
                    }
                }
            }

            const quantity = item.quantity || 1;
            const lineTotal = (product.basePrice + itemAddons) * quantity;

            subtotal += product.basePrice * quantity;
            addonsTotal += itemAddons * quantity;

            orderItems.push({
                productId: item.productId,
                recipientName: item.recipientName || 'Customer',
                athleteId: item.athleteId,
                quantity,
                basePrice: product.basePrice,
                selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
                variantPrices: itemAddons,
                lineTotal,
                nameOnJersey: item.nameOnJersey,
                numberOnJersey: item.numberOnJersey
            });
        }

        const orderNo = await generateOrderNo();

        const order = await prisma.jerseyOrder.create({
            data: {
                orderNo,
                customerId: userId!,
                clubId: orderType === 'COLLECTIVE' ? clubId : null,
                orderType: orderType || 'INDIVIDUAL',
                supplierId,
                subtotal,
                addonsTotal,
                totalAmount: subtotal + addonsTotal,
                notes,
                shippingAddress,
                items: {
                    create: orderItems
                },
                tracking: {
                    create: {
                        status: 'PENDING',
                        description: 'Order placed',
                        updatedBy: userId!
                    }
                }
            },
            include: {
                items: { include: { product: true } },
                tracking: { orderBy: { createdAt: 'desc' } }
            }
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// GET /api/v1/jersey/orders - List orders
export const listOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { status, supplierId, customerId, limit = '20' } = req.query;

        const where: Record<string, unknown> = {};

        // Role-based filtering
        if (userRole === 'SUPPLIER') {
            where.supplierId = userId;
        } else if (userRole === 'ATHLETE' || userRole === 'PARENT') {
            where.customerId = userId;
        } else if (userRole === 'CLUB') {
            // Club sees collective orders + their own
            where.OR = [
                { customerId: userId },
                { clubId: { not: null } }
            ];
        }

        // Additional filters
        if (status) where.status = status;
        if (supplierId && userRole !== 'SUPPLIER') where.supplierId = supplierId;
        if (customerId && userRole !== 'ATHLETE') where.customerId = customerId;

        const orders = await prisma.jerseyOrder.findMany({
            where,
            include: {
                items: { include: { product: { select: { name: true, designThumbnail: true } } } },
                tracking: { orderBy: { createdAt: 'desc' }, take: 1 },
                courierInfo: true
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string, 10)
        });

        res.json({
            success: true,
            data: orders.map(o => ({
                ...o,
                itemCount: o.items.length,
                latestStatus: o.tracking[0]?.status || o.status
            }))
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to list orders' });
    }
};

// GET /api/v1/jersey/orders/:id - Get order details
export const getOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.jerseyOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, designUrl: true, designThumbnail: true }
                        }
                    }
                },
                tracking: { orderBy: { createdAt: 'desc' } },
                courierInfo: true
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Parse selected variants
        const itemsWithParsedVariants = order.items.map(item => ({
            ...item,
            selectedVariants: item.selectedVariants ? JSON.parse(item.selectedVariants) : {}
        }));

        res.json({
            success: true,
            data: {
                ...order,
                items: itemsWithParsedVariants
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to get order' });
    }
};

// PUT /api/v1/jersey/orders/:id/status - Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status, paymentStatus, description } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        // Update order and add tracking entry
        const order = await prisma.jerseyOrder.update({
            where: { id },
            data: {
                status,
                paymentStatus: paymentStatus || undefined,
                tracking: {
                    create: {
                        status,
                        description: description || `Status updated to ${status}`,
                        updatedBy: userId!
                    }
                }
            },
            include: {
                tracking: { orderBy: { createdAt: 'desc' } }
            }
        });

        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

// POST /api/v1/jersey/orders/:id/cancel - Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { reason } = req.body;

        const order = await prisma.jerseyOrder.findUnique({
            where: { id },
            select: { status: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            });
        }

        const updatedOrder = await prisma.jerseyOrder.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                tracking: {
                    create: {
                        status: 'CANCELLED',
                        description: reason || 'Order cancelled by customer',
                        updatedBy: userId!
                    }
                }
            },
            include: { tracking: { orderBy: { createdAt: 'desc' } } }
        });

        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel order' });
    }
};

// POST /api/v1/jersey/orders/:id/payment-proof - Upload payment proof
export const uploadPaymentProof = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { paymentProofUrl } = req.body;

        if (!paymentProofUrl) {
            return res.status(400).json({ success: false, message: 'Payment proof URL is required' });
        }

        const order = await prisma.jerseyOrder.findUnique({
            where: { id },
            select: { customerId: true, paymentStatus: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.customerId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to upload payment for this order' });
        }

        const updatedOrder = await prisma.jerseyOrder.update({
            where: { id },
            data: {
                paymentProofUrl,
                paymentStatus: 'PENDING_VERIFICATION',
                tracking: {
                    create: {
                        status: 'PAYMENT_UPLOADED',
                        description: 'Payment proof uploaded, awaiting verification',
                        updatedBy: userId!
                    }
                }
            },
            include: { tracking: { orderBy: { createdAt: 'desc' } } }
        });

        res.json({
            success: true,
            data: updatedOrder,
            message: 'Payment proof uploaded successfully'
        });
    } catch (error) {
        console.error('Upload payment proof error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload payment proof' });
    }
};

// POST /api/v1/jersey/orders/:id/verify-payment - Verify or reject payment (Supplier only)
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT'

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
        }

        const order = await prisma.jerseyOrder.findUnique({
            where: { id },
            select: { supplierId: true, paymentStatus: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.supplierId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to verify payment for this order' });
        }

        if (order.paymentStatus !== 'PENDING_VERIFICATION') {
            return res.status(400).json({ success: false, message: 'Payment is not pending verification' });
        }

        const newPaymentStatus = action === 'APPROVE' ? 'PAID' : 'REJECTED';
        const newOrderStatus = action === 'APPROVE' ? 'CONFIRMED' : 'PENDING';

        const updatedOrder = await prisma.jerseyOrder.update({
            where: { id },
            data: {
                paymentStatus: newPaymentStatus,
                status: newOrderStatus,
                tracking: {
                    create: {
                        status: action === 'APPROVE' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
                        description: action === 'APPROVE'
                            ? 'Payment verified by supplier'
                            : `Payment rejected: ${rejectionReason || 'Invalid proof'}`,
                        updatedBy: userId!
                    }
                }
            },
            include: { tracking: { orderBy: { createdAt: 'desc' } } }
        });

        res.json({
            success: true,
            data: updatedOrder,
            message: action === 'APPROVE' ? 'Payment verified successfully' : 'Payment rejected'
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
};
