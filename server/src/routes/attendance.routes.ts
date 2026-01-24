import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rbac.middleware.js';

import prisma from '../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * POST /api/v1/attendance/scan
 * Process QR-based attendance check-in
 */
router.post('/scan', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH', 'MANPOWER'), async (req, res) => {
    try {
        const { userId, scheduleId, latitude, longitude, locationAccuracy } = req.body;

        // Check if attendance already exists
        const existing = await prisma.attendance.findUnique({
            where: { userId_scheduleId: { userId, scheduleId } },
        });

        if (existing) {
            res.status(400).json({
                success: false,
                message: 'Attendance already recorded',
                data: existing,
            });
            return;
        }

        // Get schedule to check timing
        const schedule = await prisma.trainingSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            res.status(404).json({ success: false, message: 'Schedule not found' });
            return;
        }

        // Determine status based on time
        const now = new Date();
        const lateThreshold = new Date(schedule.startTime);
        lateThreshold.setMinutes(lateThreshold.getMinutes() + 15); // 15 min grace period

        const status = now > lateThreshold ? 'LATE' : 'PRESENT';

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                scheduleId,
                checkInTime: now,
                status,
                method: 'QR_SCAN',
                latitude,
                longitude,
                locationAccuracy,
            },
            include: {
                user: { select: { name: true, avatarUrl: true } },
                schedule: { select: { title: true, startTime: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: `Check-in successful (${status})`,
            data: attendance,
        });
    } catch (error) {
        console.error('Attendance scan error:', error);
        res.status(500).json({ success: false, message: 'Failed to record attendance' });
    }
});

/**
 * POST /api/v1/attendance/checkout
 * Record check-out time
 */
router.post('/checkout', async (req, res) => {
    try {
        const { userId, scheduleId } = req.body;

        const attendance = await prisma.attendance.update({
            where: { userId_scheduleId: { userId, scheduleId } },
            data: { checkOutTime: new Date() },
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Failed to record checkout' });
    }
});

/**
 * GET /api/v1/attendance/schedule/:scheduleId
 * Get attendance for a specific schedule
 */
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const attendances = await prisma.attendance.findMany({
            where: { scheduleId: req.params.scheduleId },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true, role: true } },
            },
            orderBy: { checkInTime: 'asc' },
        });

        const summary = {
            total: attendances.length,
            present: attendances.filter(a => a.status === 'PRESENT').length,
            late: attendances.filter(a => a.status === 'LATE').length,
            excused: attendances.filter(a => a.status === 'EXCUSED').length,
        };

        res.json({ success: true, data: attendances, summary });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get attendance' });
    }
});

/**
 * GET /api/v1/attendance/user/:userId
 * Get attendance history for a user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;

        const where: any = { userId: req.params.userId };
        if (startDate || endDate) {
            where.checkInTime = {};
            if (startDate) where.checkInTime.gte = new Date(startDate as string);
            if (endDate) where.checkInTime.lte = new Date(endDate as string);
        }

        const attendances = await prisma.attendance.findMany({
            where,
            include: {
                schedule: { select: { title: true, startTime: true, venue: true } },
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { checkInTime: 'desc' },
        });

        res.json({ success: true, data: attendances });
    } catch (error) {
        console.error('Get user attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get attendance history' });
    }
});

export default router;
