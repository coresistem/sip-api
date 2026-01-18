import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Get all config logs for a user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const logs = await prisma.equipmentConfigLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 logs
        });

        res.json({
            success: true,
            data: logs.map(log => ({
                ...log,
                createdAt: log.createdAt.toISOString(),
            }))
        });
    } catch (error) {
        console.error('Error fetching config logs:', error);
        res.status(500).json({ error: 'Failed to fetch config logs' });
    }
});

// Create a new config log
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            arrowsPerEnd,
            division,
            targetFace,
            distance,
            drawLength,
            drawWeight,
            bowHeight,
            braceHeight,
            aTiller,
            bTiller,
            nockingPoint,
            arrowPoint,
            arrowLength,
            avgScoreArrow,
            totalScore,
            totalArrows,
            indexArrowScore,
            notes,
        } = req.body;

        // Calculate derived fields
        const diffTiller = aTiller && bTiller ? aTiller - bTiller : null;
        const tillerStatus = diffTiller !== null
            ? (diffTiller > 0 ? 'Positive' : diffTiller < 0 ? 'Negative' : 'Neutral')
            : null;
        const nockingStatus = nockingPoint !== undefined && nockingPoint !== null
            ? (nockingPoint > 0 ? 'Positive' : nockingPoint < 0 ? 'Negative' : 'Neutral')
            : null;

        const log = await prisma.equipmentConfigLog.create({
            data: {
                userId,
                arrowsPerEnd: arrowsPerEnd || 6,
                division,
                targetFace,
                distance,
                drawLength: drawLength || 0,
                drawWeight: drawWeight || 0,
                bowHeight,
                braceHeight,
                aTiller,
                bTiller,
                diffTiller,
                tillerStatus,
                nockingPoint,
                nockingStatus,
                arrowPoint,
                arrowLength,
                avgScoreArrow,
                totalScore,
                totalArrows,
                indexArrowScore,
                notes,
            },
        });

        res.status(201).json({
            success: true,
            data: {
                ...log,
                createdAt: log.createdAt.toISOString(),
            },
            message: 'Configuration saved successfully'
        });
    } catch (error) {
        console.error('Error saving config log:', error);
        res.status(500).json({ error: 'Failed to save config log' });
    }
});

// Get config log statistics for dashboard
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get last 10 logs with performance data
        const logs = await prisma.equipmentConfigLog.findMany({
            where: {
                userId,
                avgScoreArrow: { not: null }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                createdAt: true,
                arrowsPerEnd: true,
                drawLength: true,
                drawWeight: true,
                nockingPoint: true,
                nockingStatus: true,
                avgScoreArrow: true,
                indexArrowScore: true,
                totalScore: true,
                totalArrows: true,
            }
        });

        // Calculate averages and trends
        const avgScores = logs.filter(l => l.avgScoreArrow).map(l => l.avgScoreArrow as number);
        const overallAvg = avgScores.length > 0
            ? avgScores.reduce((a, b) => a + b, 0) / avgScores.length
            : 0;

        res.json({
            success: true,
            data: {
                logs: logs.map(log => ({
                    ...log,
                    createdAt: log.createdAt.toISOString(),
                })),
                totalLogs: logs.length,
                overallAverage: overallAvg.toFixed(2),
            }
        });
    } catch (error) {
        console.error('Error fetching config stats:', error);
        res.status(500).json({ error: 'Failed to fetch config stats' });
    }
});

// Delete a config log
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify ownership
        const log = await prisma.equipmentConfigLog.findFirst({
            where: { id, userId }
        });

        if (!log) {
            return res.status(404).json({ error: 'Config log not found' });
        }

        await prisma.equipmentConfigLog.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Config log deleted' });
    } catch (error) {
        console.error('Error deleting config log:', error);
        res.status(500).json({ error: 'Failed to delete config log' });
    }
});

export default router;
