import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { awardXP } from '../services/gamification.service.js';
import { validate } from '../middleware/validate.middleware.js';

// Validation Schemas
const dailyLogSchema = z.object({
    body: z.object({
        date: z.string(),
        rpe: z.number().min(1).max(10),
        durationMinutes: z.number().min(1),
        arrowCount: z.number().default(0),
        sleepQuality: z.number().min(1).max(5).optional(),
        fatigueLevel: z.number().min(1).max(5).optional(),
        stressLevel: z.number().min(1).max(5).optional(),
        sorenessLevel: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
        restingHR: z.number().optional(),
        hrv: z.number().optional()
    })
});

const bleepTestSchema = z.object({
    body: z.object({
        date: z.string(),
        level: z.number(),
        shuttle: z.number(),
        vo2Max: z.number()
    })
});

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/analytics/admin/audit-logs
 * Get all audit logs with pagination and filtering (Super Admin only)
 */
router.get('/admin/audit-logs', async (req, res) => {
    try {
        // Check if user is Super Admin
        if (req.user?.role !== 'SUPER_ADMIN') {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 25;
        const action = req.query.action as string | undefined;
        const entity = req.query.entity as string | undefined;

        const where: any = {};
        if (action) where.action = action;
        if (entity) where.entity = entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.auditLog.count({ where })
        ]);

        // Get unique user IDs and fetch user data
        const userIds = [...new Set(logs.map(l => l.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        // Attach user data to logs
        const logsWithUsers = logs.map(log => ({
            ...log,
            user: userMap.get(log.userId) || null
        }));

        res.json({
            success: true,
            data: logsWithUsers,
            pagination: { total, page, pageSize }
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ success: false, message: 'Failed to get audit logs' });
    }
});

/**
 * GET /api/v1/analytics/my-progress
 * Get analytics for current user (if they are an athlete)
 */
router.get('/my-progress', async (req, res) => {
    try {
        const userId = req.user!.id;

        // Find athlete record for this user
        const athlete = await prisma.athlete.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Athlete profile not found' });
            return;
        }

        const athleteId = athlete.id;
        const { period = '30' } = req.query; // days

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        // Fetch all scores in the period
        const scores = await prisma.scoringRecord.findMany({
            where: {
                athleteId,
                sessionDate: { gte: startDate },
            },
            orderBy: { sessionDate: 'asc' },
        });

        // Calculate statistics
        const totalSessions = scores.length;
        const totalArrows = scores.reduce((sum, s) => sum + s.arrowCount, 0);
        const totalScore = scores.reduce((sum, s) => sum + s.totalSum, 0);
        const overallAverage = totalArrows > 0 ? totalScore / totalArrows : 0;

        // Calculate Score Distribution
        const distribution: Record<string, number> = {
            '10+X': 0, '9': 0, '8': 0, '7': 0, '6': 0, 'M': 0
        };

        scores.forEach(session => {
            try {
                const ends = JSON.parse(session.arrowScores);
                ends.flat().forEach((score: any) => {
                    if (score === 'X' || score === 10 || score === '10') distribution['10+X']++;
                    else if (score === 9 || score === '9') distribution['9']++;
                    else if (score === 8 || score === '8') distribution['8']++;
                    else if (score === 7 || score === '7') distribution['7']++;
                    else if (score === 6 || score === '6') distribution['6']++;
                    else if (score === 'M') distribution['M']++;
                    else if (Number(score) <= 5) distribution['M']++;
                });
            } catch (e) { }
        });

        // Score progression
        const progression = scores.map(s => ({
            date: s.sessionDate.toISOString().split('T')[0],
            average: s.average,
            total: s.totalSum,
            distance: s.distance,
        }));

        // Performance by distance
        const byDistance = await prisma.scoringRecord.groupBy({
            by: ['distance'],
            where: { athleteId, sessionDate: { gte: startDate } },
            _avg: { average: true, totalSum: true },
            _count: true,
        });

        // Consistency analysis
        const averages = scores.map(s => s.average);
        const mean = averages.reduce((a, b) => a + b, 0) / averages.length || 0;
        const variance = averages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / averages.length || 0;
        const consistency = 100 - Math.min(Math.sqrt(variance) * 10, 100);

        // Best and recent scores
        const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.totalSum)) : 0;
        const recentScores = scores.slice(-5);

        // Attendance
        const attendance = await prisma.attendance.count({
            where: {
                user: { athlete: { id: athleteId } },
                checkInTime: { gte: startDate },
                status: { in: ['PRESENT', 'LATE'] },
            },
        });

        res.json({
            success: true,
            data: {
                summary: {
                    totalSessions,
                    totalArrows,
                    overallAverage: overallAverage.toFixed(2),
                    consistency: consistency.toFixed(1),
                    bestScore,
                    attendanceCount: attendance,
                },
                progression,
                byDistance: byDistance.map(d => ({
                    distance: d.distance,
                    avgScore: d._avg.average?.toFixed(2) || 0,
                    sessions: d._count,
                })),
                scoreDistribution: [
                    { name: '10+X', value: distribution['10+X'], fill: '#FFD700' },
                    { name: '9', value: distribution['9'], fill: '#C0C0C0' },
                    { name: '8', value: distribution['8'], fill: '#CD7F32' },
                    { name: '7 & below', value: distribution['7'] + distribution['6'] + distribution['M'], fill: '#EF4444' }
                ],
                skillAnalysis: [
                    { subject: 'Accuracy', A: overallAverage * 10, fullMark: 100 },
                    { subject: 'Consistency', A: consistency, fullMark: 100 },
                    { subject: 'Volume', A: Math.min((totalArrows / 1000) * 100, 100), fullMark: 100 },
                    { subject: 'Frequency', A: Math.min((totalSessions / 12) * 100, 100), fullMark: 100 },
                    { subject: 'Distance', A: byDistance.length > 0 ? Math.max(...byDistance.map(d => d.distance)) : 0, fullMark: 70 }
                ],
                recentScores: recentScores.map(s => ({
                    date: s.sessionDate,
                    total: s.totalSum,
                    average: s.average.toFixed(2),
                    distance: s.distance,
                })),
            },
        });
    } catch (error) {
        console.error('Get my progress error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});

/**
 * GET /api/v1/analytics/athlete/:id
 * Get comprehensive analytics for an athlete
 */
router.get('/athlete/:id', async (req, res) => {
    try {
        const athleteId = req.params.id;
        const { period = '30' } = req.query; // days

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        // Fetch all scores in the period
        const scores = await prisma.scoringRecord.findMany({
            where: {
                athleteId,
                sessionDate: { gte: startDate },
            },
            orderBy: { sessionDate: 'asc' },
        });

        // Calculate statistics
        const totalSessions = scores.length;
        const totalArrows = scores.reduce((sum, s) => sum + s.arrowCount, 0);
        const totalScore = scores.reduce((sum, s) => sum + s.totalSum, 0);
        const overallAverage = totalArrows > 0 ? totalScore / totalArrows : 0;

        // NEW: Calculate Score Distribution
        const distribution: Record<string, number> = {
            '10+X': 0, '9': 0, '8': 0, '7': 0, '6': 0, 'M': 0
        };

        scores.forEach(session => {
            try {
                // Parse "[[10,9,8], [X,10,9]]" structure
                const ends = JSON.parse(session.arrowScores);
                ends.flat().forEach((score: any) => {
                    if (score === 'X' || score === 10 || score === '10') distribution['10+X']++;
                    else if (score === 9 || score === '9') distribution['9']++;
                    else if (score === 8 || score === '8') distribution['8']++;
                    else if (score === 7 || score === '7') distribution['7']++;
                    else if (score === 6 || score === '6') distribution['6']++;
                    else if (score === 'M') distribution['M']++;
                    // Group 5 and below or handle differently if needed
                    else if (Number(score) <= 5) distribution['M']++;
                });
            } catch (e) {
                // Ignore parsing errors for legacy/bad data
            }
        });

        // Score progression for line chart
        const progression = scores.map(s => ({
            date: s.sessionDate.toISOString().split('T')[0],
            average: s.average,
            total: s.totalSum,
            distance: s.distance,
        }));

        // Performance by distance for radar chart
        const byDistance = await prisma.scoringRecord.groupBy({
            by: ['distance'],
            where: { athleteId, sessionDate: { gte: startDate } },
            _avg: { average: true, totalSum: true },
            _count: true,
        });

        // Consistency analysis (standard deviation of scores)
        const averages = scores.map(s => s.average);
        const mean = averages.reduce((a, b) => a + b, 0) / averages.length || 0;
        const variance = averages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / averages.length || 0;
        const consistency = 100 - Math.min(Math.sqrt(variance) * 10, 100);

        // Best and recent scores
        const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.totalSum)) : 0;
        const recentScores = scores.slice(-5);

        // --- NEW: PHASE 7.2 SHOT ANALYSIS ---

        // 1. Group Size Analysis (Standard Deviation of Arrow Values)
        // A lower std dev implies tighter grouping (consistency of value, proxy for position)
        let totalVariance = 0;
        let totalArrowsCount = 0;

        scores.forEach(s => {
            try {
                const ends = JSON.parse(s.arrowScores);
                const arrows = ends.flat().map((val: any) => {
                    if (val === 'X' || val === 10 || val === '10') return 10;
                    if (val === 'M') return 0;
                    return Number(val) || 0;
                });

                if (arrows.length > 1) {
                    const sessionMean = arrows.reduce((a: number, b: number) => a + b, 0) / arrows.length;
                    const sessionVariance = arrows.reduce((sum: number, val: number) => sum + Math.pow(val - sessionMean, 2), 0);
                    totalVariance += sessionVariance;
                    totalArrowsCount += arrows.length;
                }
            } catch (e) { }
        });

        // Normalized Grouping Score (0-100, where 100 is perfect consistency)
        // Std Dev of 0 = Perfect (Score 100). Std Dev of 3+ = Poor (Score 0).
        const avgStdDev = totalArrowsCount > 0 ? Math.sqrt(totalVariance / totalArrowsCount) : 0;
        const groupConsistency = Math.max(0, 100 - (avgStdDev * 33)); // Map 0-3 range roughly to 100-0

        // 2. Fatigue Analysis (First 3 Ends vs Last 3 Ends)
        let first3EndsSum = 0;
        let first3EndsCount = 0;
        let last3EndsSum = 0;
        let last3EndsCount = 0;

        scores.forEach(s => {
            try {
                const ends = JSON.parse(s.arrowScores); // [[10,9,8], ...]
                if (ends.length >= 6) { // Need enough ends to compare
                    // First 3
                    const first3 = ends.slice(0, 3).flat();
                    first3EndsSum += first3.reduce((a: any, b: any) => {
                        const val = (b === 'X' || b === 10 || b === '10') ? 10 : (b === 'M' ? 0 : Number(b) || 0);
                        return a + val;
                    }, 0);
                    first3EndsCount += first3.length;

                    // Last 3
                    const last3 = ends.slice(-3).flat();
                    last3EndsSum += last3.reduce((a: any, b: any) => {
                        const val = (b === 'X' || b === 10 || b === '10') ? 10 : (b === 'M' ? 0 : Number(b) || 0);
                        return a + val;
                    }, 0);
                    last3EndsCount += last3.length;
                }
            } catch (e) { }
        });

        const first3Avg = first3EndsCount > 0 ? first3EndsSum / first3EndsCount : 0;
        const last3Avg = last3EndsCount > 0 ? last3EndsSum / last3EndsCount : 0;
        const fatigueDropOff = first3Avg > 0 ? ((first3Avg - last3Avg) / first3Avg) * 100 : 0;

        // 3. X-Count Trend (Last 5 sessions)
        const xCountTrend = scores.slice(-5).map(s => ({
            date: s.sessionDate.toISOString().split('T')[0],
            xCount: s.xCount + s.tensCount // Tracking 10s and Xs together as "Gold"
        }));

        // Attendance in period
        const attendance = await prisma.attendance.count({
            where: {
                user: { athlete: { id: athleteId } },
                checkInTime: { gte: startDate },
                status: { in: ['PRESENT', 'LATE'] },
            },
        });

        res.json({
            success: true,
            data: {
                summary: {
                    totalSessions,
                    totalArrows,
                    overallAverage: overallAverage.toFixed(2),
                    consistency: consistency.toFixed(1),
                    bestScore,
                    attendanceCount: attendance,
                },
                progression,
                byDistance: byDistance.map(d => ({
                    distance: d.distance,
                    avgScore: d._avg.average?.toFixed(2) || 0,
                    sessions: d._count,
                })),
                scoreDistribution: [
                    { name: '10+X', value: distribution['10+X'], fill: '#FFD700' },
                    { name: '9', value: distribution['9'], fill: '#C0C0C0' }, // Silverish
                    { name: '8', value: distribution['8'], fill: '#CD7F32' }, // Bronze
                    { name: '7 & below', value: distribution['7'] + distribution['6'] + distribution['M'], fill: '#EF4444' }
                ],
                skillAnalysis: [
                    { subject: 'Accuracy', A: overallAverage * 10, fullMark: 100 }, // Based on avg score
                    { subject: 'Consistency', A: consistency, fullMark: 100 },
                    { subject: 'Volume', A: Math.min((totalArrows / 1000) * 100, 100), fullMark: 100 }, // 1000 arrows/month target
                    { subject: 'Frequency', A: Math.min((totalSessions / 12) * 100, 100), fullMark: 100 }, // 3 sessions/week target
                    { subject: 'Groups', A: groupConsistency, fullMark: 100 } // New Group Size metric
                ],
                shotAnalysis: {
                    groupConsistency: groupConsistency.toFixed(1),
                    fatigueDropOff: fatigueDropOff.toFixed(1),
                    first3Avg: first3Avg.toFixed(2),
                    last3Avg: last3Avg.toFixed(2),
                    xCountTrend
                },
                recentScores: recentScores.map(s => ({
                    date: s.sessionDate,
                    total: s.totalSum,
                    average: s.average.toFixed(2),
                    distance: s.distance,
                })),
            },
        });
    } catch (error) {
        console.error('Get athlete analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});

/**
 * GET /api/v1/analytics/club
 * Get club-wide analytics
 */
router.get('/club', async (req, res) => {
    try {
        const clubId = req.user!.clubId;
        const { period = '30' } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        if (!clubId) {
            res.status(400).json({ success: false, message: 'Club ID required' });
            return;
        }

        // Total athletes and active count
        const [totalAthletes, activeAthletes] = await Promise.all([
            prisma.athlete.count({ where: { clubId } }),
            prisma.athlete.count({
                where: {
                    clubId,
                    scores: { some: { sessionDate: { gte: startDate } } },
                },
            }),
        ]);

        // Sessions conducted
        const sessionCount = await prisma.trainingSchedule.count({
            where: { clubId, startTime: { gte: startDate }, status: 'COMPLETED' },
        });

        // Average scores across club
        const avgScores = await prisma.scoringRecord.aggregate({
            where: {
                athlete: { clubId },
                sessionDate: { gte: startDate },
            },
            _avg: { average: true },
            _count: true,
        });

        // Top performers
        const topPerformers = await prisma.scoringRecord.groupBy({
            by: ['athleteId'],
            where: {
                athlete: { clubId },
                sessionDate: { gte: startDate },
            },
            _avg: { average: true },
            _count: true,
            orderBy: { _avg: { average: 'desc' } },
            take: 5,
        });

        // Get athlete names for top performers
        const athleteIds = topPerformers.map(p => p.athleteId);
        const athletes = await prisma.athlete.findMany({
            where: { id: { in: athleteIds } },
            include: { user: { select: { name: true, avatarUrl: true } } },
        });

        const topPerformersWithNames = topPerformers.map(p => {
            const athlete = athletes.find(a => a.id === p.athleteId);
            return {
                athleteId: p.athleteId,
                name: athlete?.user.name || 'Unknown',
                avatarUrl: athlete?.user.avatarUrl,
                averageScore: p._avg.average?.toFixed(2) || 0,
                sessionsCount: p._count,
            };
        });

        // Financial summary
        const financials = await prisma.membershipFee.groupBy({
            by: ['status'],
            where: { athlete: { clubId } },
            _sum: { amount: true },
            _count: true,
        });

        res.json({
            success: true,
            data: {
                athletes: { total: totalAthletes, active: activeAthletes },
                sessions: sessionCount,
                scoring: {
                    totalRecords: avgScores._count,
                    clubAverage: avgScores._avg.average?.toFixed(2) || 0,
                },
                topPerformers: topPerformersWithNames,
                financials,
            },
        });
    } catch (error) {
        console.error('Get club analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});

/**
 * GET /api/v1/analytics/comparison
 * Compare athletes performance
 */
router.get('/comparison', async (req, res) => {
    try {
        const { athleteIds, distance, period = '30' } = req.query;

        if (!athleteIds) {
            res.status(400).json({ success: false, message: 'Athlete IDs required' });
            return;
        }

        const ids = (athleteIds as string).split(',');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        const where: any = {
            athleteId: { in: ids },
            sessionDate: { gte: startDate },
        };
        if (distance) where.distance = parseInt(distance as string);

        const scores = await prisma.scoringRecord.findMany({
            where,
            include: {
                athlete: { include: { user: { select: { name: true } } } },
            },
            orderBy: { sessionDate: 'asc' },
        });

        // Group by athlete
        const comparison = ids.map(id => {
            const athleteScores = scores.filter(s => s.athleteId === id);
            const name = athleteScores[0]?.athlete.user.name || 'Unknown';

            return {
                athleteId: id,
                name,
                sessions: athleteScores.length,
                avgScore: athleteScores.length > 0
                    ? (athleteScores.reduce((sum, s) => sum + s.average, 0) / athleteScores.length).toFixed(2)
                    : 0,
                progression: athleteScores.map(s => ({
                    date: s.sessionDate.toISOString().split('T')[0],
                    average: s.average,
                })),
            };
        });

        res.json({ success: true, data: comparison });
    } catch (error) {
        console.error('Get comparison error:', error);
        res.status(500).json({ success: false, message: 'Failed to get comparison' });
    }
});

/**
 * POST /api/v1/analytics/daily-log
 * Submit daily wellness and load log
 */
router.post('/daily-log', validate(dailyLogSchema), async (req, res) => {
    try {
        const userId = req.user!.id; // Authenticated user
        const { date, rpe, durationMinutes, arrowCount, sleepQuality, fatigueLevel, stressLevel, sorenessLevel, notes, restingHR, hrv } = req.body;

        const logDate = new Date(date);

        // Upsert log for the day
        const log = await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date: logDate
                }
            },
            update: {
                rpe,
                durationMinutes,
                arrowCount,
                sleepQuality,
                fatigueLevel,
                stressLevel,
                sorenessLevel,
                notes,
                restingHR,
                hrv
            },
            create: {
                userId,
                date: logDate,
                rpe,
                durationMinutes,
                arrowCount: arrowCount || 0,
                sleepQuality,
                fatigueLevel,
                stressLevel,
                sorenessLevel,
                notes,
                restingHR,
                hrv
            }
        });

        res.json({ success: true, data: log });

        // Award XP (20 XP for daily log), asynchronously
        // Find athleteId first
        prisma.athlete.findUnique({ where: { userId } }).then(athlete => {
            if (athlete) {
                awardXP(athlete.id, 20);
            }
        });
    } catch (error) {
        console.error('Submit daily log error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit daily log' });
    }
});

/**
 * GET /api/v1/analytics/acwr/:athleteId
 * Get Acute:Chronic Workload Ratio
 */
router.get('/acwr/:athleteId', async (req, res) => {
    try {
        const { athleteId } = req.params;

        // Find user ID from athlete ID
        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },
            select: { userId: true }
        });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Athlete not found' });
            return;
        }

        const userId = athlete.userId;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 28); // 28 days for Chronic load

        // Fetch logs for last 28 days
        const logs = await prisma.dailyLog.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        // Helper to calculate load (RPE * Duration)
        const calculateLoad = (log: { rpe: number; durationMinutes: number }) => log.rpe * log.durationMinutes;

        // Acute Load (Last 7 days)
        const acuteStartDate = new Date();
        acuteStartDate.setDate(acuteStartDate.getDate() - 7);
        const acuteLogs = logs.filter((l: any) => l.date >= acuteStartDate);
        const acuteLoadSum = acuteLogs.reduce((sum: number, l: any) => sum + calculateLoad(l), 0);
        const acuteLoadAvg = acuteLoadSum / 7;

        // Chronic Load (Last 28 days)
        const chronicLoadSum = logs.reduce((sum: number, l: any) => sum + calculateLoad(l), 0);
        const chronicLoadAvg = chronicLoadSum / 28;

        // ACWR Calculation
        const ratio = chronicLoadAvg > 0 ? (acuteLoadAvg / chronicLoadAvg) : 0;

        // Risk Assessment
        let riskLevel = 'LOW';
        let feedback = 'Optimal Zone';

        if (ratio < 0.8) {
            riskLevel = 'MODERATE'; // Undertraining
            feedback = 'Undertraining Risk - Increase load gradually';
        } else if (ratio >= 0.8 && ratio <= 1.3) {
            riskLevel = 'LOW'; // Optimal
            feedback = 'Optimal Loading Zone';
        } else if (ratio > 1.3 && ratio <= 1.5) {
            riskLevel = 'MODERATE'; // Overreaching
            feedback = 'Caution - High Load Spike';
        } else if (ratio > 1.5) {
            riskLevel = 'HIGH'; // Overtraining
            feedback = 'Danger Zone - High Injury Risk';
        }

        res.json({
            success: true,
            data: {
                acuteLoad: Math.round(acuteLoadAvg),
                chronicLoad: Math.round(chronicLoadAvg),
                acwr: Number(ratio.toFixed(2)),
                riskLevel,
                feedback,
                logs: logs.map((l: any) => ({
                    date: l.date.toISOString().split('T')[0],
                    load: calculateLoad(l),
                    rpe: l.rpe,
                    sleepQuality: l.sleepQuality,
                    restingHR: l.restingHR,
                    hrv: l.hrv,
                    vo2Max: l.vo2Max
                }))
            }
        });

    } catch (error) {
        console.error('ACWR calculation error:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate ACWR' });
    }
});

// Submit Bleep Test Result
router.post('/bleep-test', validate(bleepTestSchema), async (req, res) => {
    try {
        const userId = req.user!.id;
        const { date, level, shuttle, vo2Max } = req.body;

        const logDate = new Date(date);

        // Update DailyLog with VO2 Max
        const log = await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date: logDate
                }
            },
            update: {
                vo2Max,
                notes: `Bleep Test: Level ${level}, Shuttle ${shuttle}`
            },
            create: {
                userId,
                date: logDate,
                rpe: 0, // Default if created purely from test
                durationMinutes: 0,
                arrowCount: 0,
                vo2Max,
                notes: `Bleep Test: Level ${level}, Shuttle ${shuttle}`
            }
        });

        res.json({ success: true, data: log });
    } catch (error) {
        console.error('Submit bleep test error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit bleep test' });
    }
});

// Track Page View
router.post('/track-view', async (req, res) => {
    try {
        const userId = req.user!.id;
        const { path } = req.body;

        if (!path) {
            res.status(400).json({ success: false, message: 'Path required' });
            return;
        }

        // Log to AuditLog directly
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'PAGE_VIEW',
                entity: 'PATH',
                entityId: path,
                userAgent: req.headers['user-agent'] || 'Unknown',
                ipAddress: req.ip || 'Unknown'
            }
        });

        res.json({ success: true });
    } catch (error) {
        // Silent fail for analytics
        console.error('Track view error:', error);
        res.status(200).json({ success: true });
    }
});

// Get Page Coverage Stats
router.get('/page-coverage', async (req, res) => {
    try {
        // Get all unique paths visited in AuditLogs
        const visitedPaths = await prisma.auditLog.groupBy({
            by: ['entityId'],
            where: {
                action: 'PAGE_VIEW',
                entity: 'PATH',
            },
            _count: {
                entityId: true
            }
        });

        const formatted = visitedPaths
            .filter(p => p.entityId !== null)
            .map(p => ({
                path: p.entityId!,
                count: p._count.entityId
            }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Page coverage stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

// GET /analytics/user-stats - Get user registration, login, and onboarding statistics
router.get('/user-stats', async (req, res) => {
    try {
        const { range = 'daily', from, to } = req.query;

        // Calculate date range
        let startDate: Date;
        let endDate = new Date();

        if (from && to) {
            startDate = new Date(from as string);
            endDate = new Date(to as string);
        } else {
            switch (range) {
                case 'weekly':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'monthly':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'daily':
                default:
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 14); // Last 14 days for daily view
                    break;
            }
        }

        // 1. New Users (registrations) - grouped by date
        const newUsersRaw = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT DATE("created_at") as date, COUNT(*) as count
            FROM users
            WHERE "created_at" >= ${startDate} AND "created_at" <= ${endDate}
            GROUP BY DATE("created_at")
            ORDER BY date ASC
        `;

        // 2. Logins - from audit_logs where action='LOGIN'
        const loginsRaw = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT DATE("created_at") as date, COUNT(*) as count
            FROM audit_logs
            WHERE action = 'LOGIN' AND "created_at" >= ${startDate} AND "created_at" <= ${endDate}
            GROUP BY DATE("created_at")
            ORDER BY date ASC
        `;

        // 3. Onboard Visits - from audit_logs where action='PAGE_VIEW' and path contains onboarding
        const onboardVisitsRaw = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT DATE("created_at") as date, COUNT(*) as count
            FROM audit_logs
            WHERE action = 'PAGE_VIEW' AND entity_id LIKE '%onboard%'
              AND "created_at" >= ${startDate} AND "created_at" <= ${endDate}
            GROUP BY DATE("created_at")
            ORDER BY date ASC
        `;

        // Convert BigInt to Number
        const newUsers = newUsersRaw.map(r => ({ date: r.date, count: Number(r.count) }));
        const logins = loginsRaw.map(r => ({ date: r.date, count: Number(r.count) }));
        const onboardVisits = onboardVisitsRaw.map(r => ({ date: r.date, count: Number(r.count) }));

        res.json({
            success: true,
            data: {
                newUsers,
                logins,
                onboardVisits,
                range,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user stats' });
    }
});

export default router;
