import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { authenticate as requireAuth, requireRole } from '../../../middleware/auth.middleware.js';

const router = Router();

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    icon: z.string().optional(),
    parentId: z.string().optional().nullable()
});

router.get('/', async (req, res) => {
    try {
        const categories = await prisma.marketplaceCategory.findMany({
            include: { parent: true, children: true },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.marketplaceCategory.findUnique({
            where: { id },
            include: { parent: true, children: true }
        });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category' });
    }
});

router.post('/', requireAuth, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const validated = categorySchema.parse(req.body);
        const existing = await prisma.marketplaceCategory.findUnique({ where: { slug: validated.slug } });
        if (existing) return res.status(400).json({ success: false, message: 'Slug already exists' });
        const category = await prisma.marketplaceCategory.create({
            data: {
                name: validated.name,
                slug: validated.slug,
                description: validated.description,
                icon: validated.icon,
                parentId: validated.parentId || null
            }
        });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});

export default router;
