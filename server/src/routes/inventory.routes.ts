import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../middleware/rbac.middleware.js';

import prisma from '../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/inventory
 * Get club asset inventory
 */
router.get('/', requireClubAccess, async (req, res) => {
    try {
        const clubId = req.user!.clubId || req.query.clubId;
        const { category, status, condition, search, page = 1, limit = 20 } = req.query;

        const where: any = {};
        if (clubId) where.clubId = clubId;
        if (category) where.category = category;
        if (status) where.status = status;
        if (condition) where.condition = condition;
        if (search) {
            where.OR = [
                { itemName: { contains: search as string, mode: 'insensitive' } },
                { brand: { contains: search as string, mode: 'insensitive' } },
                { serialNumber: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [assets, total] = await Promise.all([
            prisma.assetInventory.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.assetInventory.count({ where }),
        ]);

        res.json({
            success: true,
            data: assets,
            pagination: { page: Number(page), limit: Number(limit), total },
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to get inventory' });
    }
});

/**
 * POST /api/v1/inventory
 * Add new asset
 */
router.post('/', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER'), async (req, res) => {
    try {
        const clubId = req.body.clubId || req.user!.clubId;
        const {
            itemName, category, brand, model, serialNumber, quantity, status, condition,
            purchaseDate, purchasePrice, supplier, warrantyExpiry, maintenanceCycle,
            storageLocation, imageUrl, notes,
        } = req.body;

        const asset = await prisma.assetInventory.create({
            data: {
                clubId,
                itemName,
                category,
                brand,
                model,
                serialNumber,
                quantity: quantity ? parseInt(quantity) : 1,
                status: status || 'AVAILABLE',
                condition: condition || 'GOOD',
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
                supplier,
                warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
                maintenanceCycle: maintenanceCycle ? parseInt(maintenanceCycle) : null,
                storageLocation,
                imageUrl,
                notes,
            },
        });

        res.status(201).json({ success: true, data: asset });
    } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({ success: false, message: 'Failed to create asset' });
    }
});

/**
 * PUT /api/v1/inventory/:id
 * Update asset
 */
router.put('/:id', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER'), async (req, res) => {
    try {
        const asset = await prisma.assetInventory.update({
            where: { id: req.params.id },
            data: req.body,
        });

        res.json({ success: true, data: asset });
    } catch (error) {
        console.error('Update asset error:', error);
        res.status(500).json({ success: false, message: 'Failed to update asset' });
    }
});

/**
 * DELETE /api/v1/inventory/:id
 */
router.delete('/:id', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        await prisma.assetInventory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete asset' });
    }
});

/**
 * POST /api/v1/inventory/:id/maintenance
 * Log maintenance for an asset
 */
router.post('/:id/maintenance', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER'), async (req, res) => {
    try {
        const assetId = req.params.id;
        const { description, performedBy, cost, conditionBefore, conditionAfter, notes } = req.body;

        // Create maintenance log
        const log = await prisma.assetMaintenanceLog.create({
            data: {
                assetId,
                maintenanceDate: new Date(),
                description,
                performedBy,
                cost: cost ? parseFloat(cost) : null,
                conditionBefore,
                conditionAfter,
                notes,
            },
        });

        // Update asset condition and maintenance date
        await prisma.assetInventory.update({
            where: { id: assetId },
            data: {
                condition: conditionAfter,
                lastMaintenanceDate: new Date(),
                nextMaintenanceDate: conditionAfter === 'EXCELLENT' || conditionAfter === 'GOOD'
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        res.status(201).json({ success: true, data: log });
    } catch (error) {
        console.error('Log maintenance error:', error);
        res.status(500).json({ success: false, message: 'Failed to log maintenance' });
    }
});

/**
 * GET /api/v1/inventory/stats
 * Get inventory statistics
 */
router.get('/stats', requireClubAccess, async (req, res) => {
    try {
        const clubId = req.user!.clubId;

        const [byStatus, byCategory, needsMaintenance] = await Promise.all([
            prisma.assetInventory.groupBy({
                by: ['status'],
                where: { clubId: clubId || undefined },
                _count: true,
            }),
            prisma.assetInventory.groupBy({
                by: ['category'],
                where: { clubId: clubId || undefined },
                _count: true,
            }),
            prisma.assetInventory.count({
                where: {
                    clubId: clubId || undefined,
                    nextMaintenanceDate: { lte: new Date() },
                },
            }),
        ]);

        res.json({
            success: true,
            data: { byStatus, byCategory, needsMaintenance },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

export default router;
