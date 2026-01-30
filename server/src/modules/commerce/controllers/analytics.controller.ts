import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

// GET /api/v1/jersey/analytics/sales
// Get sales trend (revenue over time)
export const getSalesAnalytics = async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query; // days
        const supplierId = req.user?.id;
        const role = req.user?.role;

        // If not supplier or admin, restrict access? 
        // For now, assuming middleware handles role check, but good to filter by supplierId if role is SUPPLIER

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        const where: any = {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' },
            paymentStatus: 'PAID'
        };

        if (role === 'SUPPLIER') {
            where.supplierId = supplierId;
        }

        const orders = await prisma.jerseyOrder.findMany({
            where,
            select: {
                createdAt: true,
                totalAmount: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by date
        const salesByDate: Record<string, number> = {};

        // Initialize all dates in range to 0 to prevent gaps
        for (let i = 0; i < Number(period); i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i + 1);
            const dateStr = date.toISOString().split('T')[0];
            salesByDate[dateStr] = 0;
        }

        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (salesByDate[dateStr] !== undefined) {
                salesByDate[dateStr] += order.totalAmount;
            }
        });

        const data = Object.entries(salesByDate).map(([date, total]) => ({
            date,
            total
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get sales analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get sales analytics' });
    }
};

// GET /api/v1/jersey/analytics/top-products
// Get top selling products
export const getTopProducts = async (req: Request, res: Response) => {
    try {
        const { limit = '5' } = req.query;
        const supplierId = req.user?.id;
        const role = req.user?.role;

        const whereOrder: any = {
            status: { not: 'CANCELLED' },
            paymentStatus: 'PAID'
        };

        if (role === 'SUPPLIER') {
            whereOrder.supplierId = supplierId;
        }

        // Aggregate order items
        // Since Prisma doesn't support deep relation aggregation easily in groupBy, 
        // we might need to fetch qualified orders and then aggregate, or use raw query.
        // For simplicity with Prisma, fetching items of paid orders is easier.

        const items = await prisma.jerseyOrderItem.findMany({
            where: {
                order: whereOrder
            },
            include: {
                product: {
                    select: { name: true, designThumbnail: true }
                }
            }
        });

        const productSales: Record<string, { name: string; quantity: number; revenue: number; thumbnail?: string }> = {};

        items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    name: item.product?.name || 'Unknown',
                    quantity: 0,
                    revenue: 0,
                    thumbnail: item.product?.designThumbnail || undefined
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.lineTotal;
        });

        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, Number(limit));

        res.json({ success: true, data: sortedProducts });
    } catch (error) {
        console.error('Get top products error:', error);
        res.status(500).json({ success: false, message: 'Failed to get top products' });
    }
};

// GET /api/v1/jersey/customers
// Get list of customers who have purchased from the supplier
export const getCustomerList = async (req: Request, res: Response) => {
    try {
        const supplierId = req.user?.id;
        const role = req.user?.role;

        const whereOrder: any = {
            status: { not: 'CANCELLED' },
            paymentStatus: { in: ['PAID', 'CONFIRMED'] }
        };

        if (role === 'SUPPLIER') {
            whereOrder.supplierId = supplierId;
        }

        // Get all unique customers from orders
        const orders = await prisma.jerseyOrder.findMany({
            where: whereOrder,
            select: {
                customerId: true,
                totalAmount: true,
                createdAt: true
            }
        });

        // Group by customerId
        const customerStats: Record<string, { totalOrders: number; totalSpent: number; lastOrderDate: Date }> = {};

        orders.forEach(order => {
            if (!customerStats[order.customerId]) {
                customerStats[order.customerId] = {
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrderDate: new Date(0)
                };
            }
            const stats = customerStats[order.customerId];
            stats.totalOrders += 1;
            stats.totalSpent += order.totalAmount;
            if (order.createdAt > stats.lastOrderDate) {
                stats.lastOrderDate = order.createdAt;
            }
        });

        // Fetch user details for these customers
        const customerIds = Object.keys(customerStats);
        const users = await prisma.user.findMany({
            where: { id: { in: customerIds } },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                phone: true,
                cityId: true,
                provinceId: true
            }
        });

        const customerList = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            ...customerStats[user.id]
        }));

        res.json({ success: true, data: customerList });
    } catch (error) {
        console.error('Get customer list error:', error);
        res.status(500).json({ success: false, message: 'Failed to get customer list' });
    }
};

// GET /api/v1/jersey/customers/:id
// Get customer details and their order history with this supplier
export const getCustomerDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const supplierId = req.user?.id;
        const role = req.user?.role;

        // Custom details
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                provinceId: true,
                cityId: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const whereOrder: any = {
            customerId: id,
            status: { not: 'CANCELLED' }
        };

        if (role === 'SUPPLIER') {
            whereOrder.supplierId = supplierId;
        }

        const orders = await prisma.jerseyOrder.findMany({
            where: whereOrder,
            include: {
                items: {
                    include: {
                        product: { select: { name: true, designThumbnail: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                profile: user,
                orders
            }
        });
    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ success: false, message: 'Failed to get customer details' });
    }
};

// GET /api/v1/jersey/inventory/alerts
// Get products with low stock
export const getInventoryAlerts = async (req: Request, res: Response) => {
    try {
        const supplierId = req.user?.id;
        const role = req.user?.role;

        const where: any = {
            isActive: true, // Only check active products
            // stock <= lowStockThreshold - Prisma doesn't support field comparison directly in where easily without raw query or specific features
            // But we can fetch all active products for the supplier and filter in JS for simplicity if dataset is small.
            // Or use Prisma's `raw` query if needed. 
            // Given "made to order" context, maybe "stock" isn't used much yet, but we just added it.
            // Let's filter in JS for now as product catalogs aren't huge usually.
        };

        if (role === 'SUPPLIER') {
            where.supplierId = supplierId;
        }

        const products = await prisma.jerseyProduct.findMany({
            where,
            select: {
                id: true,
                name: true,
                sku: true,
                stock: true,
                lowStockThreshold: true,
                designThumbnail: true
            }
        });

        const alerts = products.filter((p: any) => p.stock <= p.lowStockThreshold);

        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('Get inventory alerts error:', error);
        res.status(500).json({ success: false, message: 'Failed to get inventory alerts' });
    }
};
