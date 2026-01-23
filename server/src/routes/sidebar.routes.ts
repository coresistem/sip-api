import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Schema for validation
const SidebarConfigSchema = z.object({
    role: z.string(),
    groups: z.string() // JSON string
});

/**
 * GET /api/v1/sidebar/
 * Get all sidebar configurations
 */
router.get('/config/all', async (req, res) => {
    try {
        const configs = await prisma.sidebarRoleConfig.findMany();
        res.json(configs);
    } catch (error) {
        console.error('Error fetching all sidebar configs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/v1/sidebar/:role
 * Get sidebar config for a specific role
 */
router.get('/:role', async (req, res) => {
    try {
        const { role } = req.params;

        const config = await prisma.sidebarRoleConfig.findUnique({
            where: { role: role.toUpperCase() }
        });

        if (!config) {
            return res.status(404).json({ message: 'No custom sidebar config found' });
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching sidebar config:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/v1/sidebar/:role
 * Save/Update sidebar config for a role
 */
router.post('/:role', async (req, res) => {
    try {
        const { role } = req.params; // from URL
        const { groups } = req.body; // payload

        // Validate JSON string
        try {
            JSON.parse(groups);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON for groups' });
        }

        const config = await prisma.sidebarRoleConfig.upsert({
            where: { role: role.toUpperCase() },
            update: { groups },
            create: {
                role: role.toUpperCase(),
                groups
            }
        });

        res.json(config);
    } catch (error) {
        console.error('Error saving sidebar config:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/v1/sidebar/reset/:role
 * Reset sidebar config for a role (delete it)
 */
router.post('/reset/:role', async (req, res) => {
    try {
        const { role } = req.params;

        await prisma.sidebarRoleConfig.delete({
            where: { role: role.toUpperCase() }
        }).catch(() => {
            // Ignore if not found
        });

        res.json({ message: 'Sidebar config reset to default' });
    } catch (error) {
        console.error('Error resetting sidebar config:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
