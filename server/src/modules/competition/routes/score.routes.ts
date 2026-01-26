import { Router } from 'express';
import { z } from 'zod';
import { awardXP } from '../../../services/gamification.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../../../middleware/rbac.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';

import prisma from '../../../lib/prisma.js';

// Validation Schemas
const submitScoreSchema = z.object({
    body: z.object({
        athleteId: z.string().optional(),
        sessionDate: z.string(),
        sessionType: z.enum(['TRAINING', 'COMPETITION', 'ASSESSMENT']).default('TRAINING'),
        distance: z.preprocess((val) => Number(val), z.number().min(1)),
        targetFace: z.string().optional().nullable(),
        arrowScores: z.array(z.array(z.union([z.number(), z.string()]))),
        notes: z.string().optional().nullable(),
        weatherCondition: z.string().optional().nullable(),
        scheduleId: z.string().optional().nullable(),
    })
});

const router = Router();
router.use(authenticate);

/**
 * POST /api/v1/scores/submit
 * Submit real-time score for a training session
 */
router.post('/submit', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH', 'ATHLETE'), validate(submitScoreSchema), async (req, res) => {
    try {
        let {
            athleteId, sessionDate, sessionType, distance, targetFace,
            arrowScores, notes, weatherCondition, scheduleId,
        } = req.body;

        // If athleteId is not provided and user is ATHLETE, use their own athleteId
        if (!athleteId && req.user?.role === 'ATHLETE') {
            const athlete = await prisma.athlete.findUnique({
                where: { userId: req.user.id }
            });
            if (athlete) {
                athleteId = athlete.id;
            } else {
                return res.status(400).json({ success: false, message: 'Athlete profile not found for this user' });
            }
        }

        if (!athleteId) {
            return res.status(400).json({ success: false, message: 'Athlete ID is required' });
        }


        // Calculate totals from arrow scores
        // arrowScores format: [[10, 9, 8], [10, 10, 9], ...] - each sub-array is an end
        const allArrows = arrowScores.flat();
        const totalSum = allArrows.reduce((sum: number, score: number | string) => sum + (score === 'X' ? 10 : (score === 'M' ? 0 : Number(score))), 0); // Handle X and M if strings
        const arrowCount = allArrows.length;
        const average = arrowCount > 0 ? totalSum / arrowCount : 0;
        const tensCount = allArrows.filter((s: number | string) => s === 10 || s === 'X' || s === '10').length;
        const xCount = allArrows.filter((s: number | string) => s === 'X' || s === 11).length;

        const scoreData: any = {
            athleteId,
            scheduleId,
            sessionDate: new Date(sessionDate),
            sessionType: sessionType || 'TRAINING',
            distance: parseInt(distance),
            targetFace,
            arrowScores: JSON.stringify(arrowScores), // Ensure it's stored as string if needed by schema (Schema says String)
            totalSum,
            arrowCount,
            average,
            tensCount,
            xCount,
            notes,
            weatherCondition,
        };

        // If submitted by a coach, attach coachId
        if (req.user?.role === 'COACH' || req.user?.role === 'CLUB' || req.user?.role === 'SUPER_ADMIN') {
            scoreData.coachId = req.user.id;
        }

        const score = await prisma.scoringRecord.create({
            data: scoreData,

            include: {
                athlete: {
                    include: { user: { select: { name: true } } },
                },
                coach: { select: { name: true } },
            },
        });

        // Award XP (50 XP for scoring session)
        await awardXP(athleteId, 50);

        res.status(201).json({
            success: true,
            data: score,
            message: 'Score submitted successfully',
        });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit score' });
    }
});

/**
 * PATCH /api/v1/scores/:id/verify
 * Verify a scoring record (Coach only)
 */
router.patch('/:id/verify', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH'), async (req, res) => {
    try {
        const { id } = req.params;
        const coachId = req.user!.id;

        const score = await prisma.scoringRecord.update({
            where: { id },
            data: {
                isVerified: true,
                coachId: coachId
            },
            include: {
                athlete: { include: { user: { select: { name: true } } } }
            }
        });

        // Award extra XP for verification? Optional.

        res.json({ success: true, data: score, message: 'Score verified successfully' });
    } catch (error) {
        console.error('Verify score error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify score' });
    }
});

/**
 * GET /api/v1/scores/my-scores
 * Get current user's own scores (for athletes)
 */
router.get('/my-scores', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 10 } = req.query;

        // Find athlete profile for this user
        const athlete = await prisma.athlete.findUnique({
            where: { userId }
        });

        if (!athlete) {
            return res.json({ success: true, data: [], message: 'No athlete profile found' });
        }

        const scores = await prisma.scoringRecord.findMany({
            where: { athleteId: athlete.id },
            orderBy: { sessionDate: 'desc' },
            take: Number(limit),
            select: {
                id: true,
                sessionDate: true,
                distance: true,
                totalSum: true,
                arrowCount: true,
                average: true,
                tensCount: true,
                xCount: true,
                sessionType: true,
            }
        });

        res.json({ success: true, data: scores });
    } catch (error) {
        console.error('Get my scores error:', error);
        res.status(500).json({ success: false, message: 'Failed to get scores' });
    }
});

/**
 * GET /api/v1/scores
 * Get scores with filtering
 */
router.get('/', requireClubAccess, async (req, res) => {
    try {
        const { athleteId, coachId, startDate, endDate, sessionType, isVerified, page = 1, limit = 20 } = req.query;

        const where: any = {};
        if (athleteId) where.athleteId = athleteId;
        if (coachId) where.coachId = coachId;
        if (sessionType) where.sessionType = sessionType;

        // Support isVerified filter (for pending verifications)
        if (isVerified !== undefined) {
            where.isVerified = isVerified === 'true';
        }

        if (startDate || endDate) {
            where.sessionDate = {};
            if (startDate) where.sessionDate.gte = new Date(startDate as string);
            if (endDate) where.sessionDate.lte = new Date(endDate as string);
        }

        // Filter by club for non-admin users
        if (req.user!.clubId) {
            where.athlete = { clubId: req.user!.clubId };
        }

        const [scores, total] = await Promise.all([
            prisma.scoringRecord.findMany({
                where,
                include: {
                    athlete: { include: { user: { select: { name: true } } } },
                    coach: { select: { name: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { sessionDate: 'desc' },
            }),
            prisma.scoringRecord.count({ where }),
        ]);

        res.json({
            success: true,
            data: scores,
            pagination: { page: Number(page), limit: Number(limit), total },
        });
    } catch (error) {
        console.error('Get scores error:', error);
        res.status(500).json({ success: false, message: 'Failed to get scores' });
    }
});

/**
 * GET /api/v1/scores/session/:scheduleId
 * Get scores for a specific training session
 */
router.get('/session/:scheduleId', async (req, res) => {
    try {
        const scores = await prisma.scoringRecord.findMany({
            where: { scheduleId: req.params.scheduleId },
            include: {
                athlete: { include: { user: { select: { name: true, avatarUrl: true } } } },
            },
            orderBy: { totalSum: 'desc' },
        });

        res.json({ success: true, data: scores });
    } catch (error) {
        console.error('Get session scores error:', error);
        res.status(500).json({ success: false, message: 'Failed to get session scores' });
    }
});

/**
 * GET /api/v1/scores/leaderboard
 * Get live leaderboard for a session or date
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { scheduleId, date, distance, limit = 10 } = req.query;
        const clubId = req.user!.clubId;

        const where: any = { athlete: { clubId } };
        if (scheduleId) where.scheduleId = scheduleId;
        if (date) {
            const targetDate = new Date(date as string);
            where.sessionDate = {
                gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                lt: new Date(targetDate.setHours(23, 59, 59, 999)),
            };
        }
        if (distance) where.distance = parseInt(distance as string);

        const scores = await prisma.scoringRecord.findMany({
            where,
            include: {
                athlete: { include: { user: { select: { name: true, avatarUrl: true } } } },
            },
            orderBy: { totalSum: 'desc' },
            take: Number(limit),
        });

        const leaderboard = scores.map((score, index) => ({
            rank: index + 1,
            athleteName: score.athlete.user.name,
            avatarUrl: score.athlete.user.avatarUrl,
            totalScore: score.totalSum,
            arrowCount: score.arrowCount,
            average: score.average.toFixed(2),
            tensCount: score.tensCount,
            distance: score.distance,
        }));

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to get leaderboard' });
    }
});

export default router;
