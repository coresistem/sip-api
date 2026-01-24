import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getEffectiveSupplierId } from '../services/supplier.service.js';

const router = express.Router();

// Validation Schemas
const updateShippingSchema = z.object({
    body: z.object({
        courierName: z.string().min(1, "Courier name is required"),
        awbNumber: z.string().min(1, "AWB number is required"),
        trackingUrl: z.string().url().optional().or(z.literal("")),
        shippingCost: z.preprocess((val) => Number(val), z.number().min(0).default(0)),
        estimatedDelivery: z.string().optional()
    })
});

// Middleware: All routes require authentication
router.use(authenticate);
// GET /shipping - List all orders with courier info (Filtered by Supplier)
router.get('/', requireRole(['SUPPLIER', 'MANPOWER', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const user = (req as any).user;
        const supplierId = await getEffectiveSupplierId(user);

        const where: any = {};
        if (supplierId) {
            where.supplierId = supplierId;
        } else if (user.role !== 'SUPER_ADMIN') {
            // If not admin and no supplierId found for manpower, return empty
            return res.json({ success: true, data: [] });
        }

        const orders = await prisma.jerseyOrder.findMany({
            where,
            include: {
                courierInfo: true,
                items: true,
                tasks: {
                    include: { manpower: true } // Include manpower tasks
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get shipping error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch shipping info' });
    }
});

// POST /shipping/:orderId - Create or Update Courier Info
router.post('/:orderId', requireRole(['SUPPLIER', 'MANPOWER', 'SUPER_ADMIN']), validate(updateShippingSchema), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { courierName, awbNumber, trackingUrl, shippingCost, estimatedDelivery } = req.body;
        const user = (req as any).user;

        // Verify order access
        const order = await prisma.jerseyOrder.findUnique({
            where: { id: orderId },
            select: { supplierId: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const supplierId = await getEffectiveSupplierId(user);
        if (user.role !== 'SUPER_ADMIN' && order.supplierId !== supplierId) {
            return res.status(403).json({ success: false, message: 'Access denied to this order' });
        }

        const courierInfo = await prisma.courierInfo.upsert({
            where: { orderId },
            update: {
                courierName,
                awbNumber,
                trackingUrl,
                shippingCost: parseFloat(shippingCost),
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                shippedAt: new Date(), // Set shipped date on update
            },
            create: {
                orderId,
                courierName,
                awbNumber,
                trackingUrl,
                shippingCost: parseFloat(shippingCost),
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                shippedAt: new Date(),
            }
        });

        // Update Order Status to SHIPPED
        await prisma.jerseyOrder.update({
            where: { id: orderId },
            data: { status: 'SHIPPED' }
        });

        // Add tracking record
        await prisma.orderTracking.create({
            data: {
                orderId,
                status: 'SHIPPED',
                description: `Shipping info updated: ${courierName} - AWB: ${awbNumber}`,
                updatedBy: user.id
            }
        });

        res.json({ success: true, data: courierInfo, message: 'Shipping info updated' });
    } catch (error) {
        console.error('Update shipping error:', error);
        res.status(500).json({ success: false, message: 'Failed to update shipping info' });
    }
});

// GET /shipping/track/:awb - Mock Tracking Endpoint
router.get('/track/:awb', async (req, res) => {
    const { awb } = req.params;

    // Mock response simulating external API
    const mockStatus = ['IN_TRANSIT', 'DELIVERED', 'PENDING'][Math.floor(Math.random() * 3)];

    res.json({
        success: true,
        data: {
            awb,
            status: mockStatus,
            lastUpdate: new Date(),
            history: [
                { status: 'PICKED_UP', time: new Date(Date.now() - 86400000) },
                { status: 'IN_TRANSIT', time: new Date() }
            ]
        }
    });
});

export default router;
