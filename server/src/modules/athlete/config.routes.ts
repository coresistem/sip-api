import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import prisma from '../../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * POST /api/v1/config
 * Save equipment configuration and performance log
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user!.id;
        const data = req.body;

        const log = await prisma.equipmentConfigLog.create({
            data: {
                userId,
                arrowsPerEnd: parseInt(data.arrowsPerEnd) || 6,
                division: data.division,
                targetFace: data.targetFace,
                distance: parseInt(data.distance),
                drawLength: parseFloat(data.drawLength) || 0,
                drawWeight: parseFloat(data.drawWeight) || 0,
                bowHeight: data.bowHeight,
                braceHeight: parseFloat(data.braceHeight) || 0,
                aTiller: parseFloat(data.aTiller) || 0,
                bTiller: parseFloat(data.bTiller) || 0,
                diffTiller: (parseFloat(data.aTiller) || 0) - (parseFloat(data.bTiller) || 0),
                nockingPoint: parseFloat(data.nockingPoint) || 0,
                arrowPoint: parseFloat(data.arrowPoint) || 0,
                arrowLength: parseFloat(data.arrowLength) || 0,
                avgScoreArrow: parseFloat(data.avgScoreArrow) || 0,
                totalScore: parseInt(data.totalScore) || 0,
                totalArrows: parseInt(data.totalArrows) || 0,
                indexArrowScore: parseFloat(data.indexArrowScore) || 0,
            }
        });

        res.json({ success: true, data: log });
    } catch (error) {
        console.error('Save config error:', error);
        res.status(500).json({ success: false, message: 'Failed to save configuration log' });
    }
});

/**
 * GET /api/v1/config/history
 * Get configuration history for trend analysis
 */
router.get('/history', async (req, res) => {
    try {
        const userId = req.user!.id;
        const { period = '30' } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        const logs = await prisma.equipmentConfigLog.findMany({
            where: {
                userId,
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                createdAt: true,
                indexArrowScore: true,
                distance: true,
                drawWeight: true,
                braceHeight: true,
                totalScore: true,
                totalArrows: true
            }
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Get config history error:', error);
        res.status(500).json({ success: false, message: 'Failed to get configuration history' });
    }
});

export default router;
