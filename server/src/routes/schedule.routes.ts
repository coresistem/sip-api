import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../middleware/rbac.middleware.js';

import prisma from '../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/schedules
 * Get training schedules
 */
router.get('/', async (req, res) => {
    try {
        const clubId = req.user!.clubId || req.query.clubId;
        const { startDate, endDate, status, upcoming, page = 1, limit = 20 } = req.query;

        const where: any = {};
        if (clubId) where.clubId = clubId;
        if (status) where.status = status;

        // Handle upcoming filter
        if (upcoming === 'true') {
            where.startTime = { gte: new Date() };
        } else if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate as string);
            if (endDate) where.startTime.lte = new Date(endDate as string);
        }

        const schedules = await prisma.trainingSchedule.findMany({
            where,
            include: {
                _count: { select: { participants: true, attendances: true } },
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { startTime: upcoming === 'true' ? 'asc' : 'desc' },
        });

        res.json({ success: true, data: schedules });
    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ success: false, message: 'Failed to get schedules' });
    }
});

/**
 * POST /api/v1/schedules
 * Create new training schedule
 */
router.post('/', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'COACH'), async (req, res) => {
    try {
        const {
            title, description, startTime, endTime, venue,
            maxParticipants, targetCategory, targetSkillLevel, isRecurring, recurringPattern,
        } = req.body;

        const clubId = req.body.clubId || req.user!.clubId;

        const schedule = await prisma.trainingSchedule.create({
            data: {
                clubId,
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                venue,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                targetCategory,
                targetSkillLevel,
                isRecurring: isRecurring || false,
                recurringPattern,
            },
        });

        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ success: false, message: 'Failed to create schedule' });
    }
});

/**
 * PUT /api/v1/schedules/:id
 * Update schedule
 */
router.put('/:id', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'COACH'), async (req, res) => {
    try {
        const schedule = await prisma.trainingSchedule.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
                endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
            },
        });

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ success: false, message: 'Failed to update schedule' });
    }
});

/**
 * DELETE /api/v1/schedules/:id
 */
router.delete('/:id', requireRoles('SUPER_ADMIN', 'CLUB_OWNER'), async (req, res) => {
    try {
        await prisma.trainingSchedule.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete schedule' });
    }
});

/**
 * POST /api/v1/schedules/:id/register
 * Register athlete for a schedule
 */
router.post('/:id/register', async (req, res) => {
    try {
        const { athleteId } = req.body;

        const participant = await prisma.scheduleParticipant.create({
            data: {
                scheduleId: req.params.id,
                athleteId,
            },
        });

        res.status(201).json({ success: true, data: participant });
    } catch (error) {
        console.error('Register for schedule error:', error);
        res.status(500).json({ success: false, message: 'Failed to register' });
    }
});

export default router;
