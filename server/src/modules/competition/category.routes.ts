import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireClubAccess, requireRoles } from '../../middleware/rbac.middleware.js';
import prisma from '../../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/inventory/categories
 * List categories for a club
 */
router.get('/', requireClubAccess, async (req, res) => {
    try {
        const clubId = (req.user!.clubId || req.query.clubId) as string;
        const categories = await prisma.assetCategory.findMany({
            where: { clubId },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to get categories' });
    }
});

/**
 * POST /api/v1/inventory/categories
 * Create a new category
 */
router.post('/', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER'), async (req, res) => {
    try {
        const clubId = req.body.clubId || req.user!.clubId;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const category = await prisma.assetCategory.create({
            data: {
                clubId,
                name
            }
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});

/**
 * DELETE /api/v1/inventory/categories/:id
 * Delete a category
 */
router.delete('/:id', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        // Optional: Check if used? 
        // For now, allow deletion, assets with this string 'category' will just have a string that's no longer in the list
        await prisma.assetCategory.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});

export default router;
