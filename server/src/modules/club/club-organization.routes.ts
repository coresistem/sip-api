import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireClubAccess } from '../../middleware/rbac.middleware.js';
import { body } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Get Organization Structure
router.get('/', authenticate, requireClubAccess, async (req, res) => {
    try {
        const clubId = req.user?.clubId;

        const organization = await prisma.clubOrganization.findMany({
            where: { clubId },
            orderBy: { sortOrder: 'asc' }
        });

        res.json({
            status: 'success',
            data: organization
        });
    } catch (error) {
        console.error('Fetch organization error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch organization structure' });
    }
});

// Add Organization Member
router.post(
    '/',
    authenticate,
    requireClubAccess,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('position').notEmpty().withMessage('Position is required'),
        body('sortOrder').isInt().optional(),
    ],
    async (req, res) => {
        try {
            const clubId = req.user?.clubId;
            const { name, position, customTitle, whatsapp, email, sortOrder } = req.body;

            const member = await prisma.clubOrganization.create({
                data: {
                    clubId: clubId!,
                    name,
                    position,
                    customTitle,
                    whatsapp,
                    email,
                    sortOrder: sortOrder || 0
                }
            });

            res.status(201).json({
                status: 'success',
                data: member
            });
        } catch (error) {
            console.error('Create organization member error:', error);
            res.status(500).json({ status: 'error', message: 'Failed to add organization member' });
        }
    }
);

// Update Organization Member
router.put('/:id', authenticate, requireClubAccess, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, customTitle, whatsapp, email, sortOrder, isActive } = req.body;

        const member = await prisma.clubOrganization.update({
            where: { id },
            data: {
                name,
                position,
                customTitle,
                whatsapp,
                email,
                sortOrder,
                isActive
            }
        });

        res.json({
            status: 'success',
            data: member
        });
    } catch (error) {
        console.error('Update organization member error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update organization member' });
    }
});

// Delete Organization Member
router.delete('/:id', authenticate, requireClubAccess, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.clubOrganization.delete({ where: { id } });
        res.json({ status: 'success', message: 'Organization member removed' });
    } catch (error) {
        console.error('Delete organization member error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to remove organization member' });
    }
});

export default router;
