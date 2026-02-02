import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../../middleware/rbac.middleware.js';

import prisma from '../../lib/prisma.js';
import { LEVELS } from '../../services/gamification.service.js';
import { AthleteController } from './athlete.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/athletes/achievements
 * Get achievements for current user
 */
router.get('/achievements', async (req, res) => {
    try {
        const achievements = await prisma.historyLog.findMany({
            where: {
                userId: req.user!.id,
                logType: 'ACHIEVEMENT'
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to frontend format
        const mappedHelper = (achievement: string | null) => {
            if (achievement === 'GOLD') return 1;
            if (achievement === 'SILVER') return 2;
            if (achievement === 'BRONZE') return 3;
            return 0; // Participation
        };

        const mappedTypeHelper = (level: string | null) => {
            if (level === 'INTERNATIONAL') return 'INTERNATIONAL';
            if (level === 'NATIONAL') return 'NATIONAL';
            if (level === 'PROVINCE') return 'PROVINCIAL';
            if (level === 'CITY') return 'REGIONAL';
            return 'CLUB';
        };

        const data = achievements.map(log => ({
            id: log.id,
            title: `${log.achievement || 'Participation'} - ${log.division || 'Unknown'}`,
            eventName: log.eventName || 'Unknown Event',
            eventType: mappedTypeHelper(log.level),
            date: log.createdAt.toISOString().split('T')[0], // Using createdAt as event date for now if year is just an int
            venue: log.toCity || 'Unknown Venue',
            position: mappedHelper(log.achievement),
            category: `${log.division || ''} - ${log.distance || ''}`,
            score: 0, // Not stored in history log typically
            maxScore: 0
        }));

        res.json(data);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ success: false, message: 'Failed to get achievements' });
    }
});

/**
 * GET /api/v1/athletes/:id/performance
 * Get performance history for charts
 */
router.get('/:id/performance', AthleteController.getPerformanceStats);

/**
 * GET /api/v1/athletes
 * Get list of athletes (filtered by club)
 */
router.get('/', requireClubAccess, async (req, res) => {
    try {
        const { clubId } = req.user!;
        const { category, skillLevel, search, page = 1, limit = 20 } = req.query;

        const where: any = {};

        // Club filtering (SuperAdmin can see all)
        if (clubId) {
            where.clubId = clubId;
        } else if (req.query.clubId) {
            where.clubId = req.query.clubId;
        }

        // Optional filters
        if (category) where.archeryCategory = category;
        if (skillLevel) where.skillLevel = skillLevel;
        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                ],
            };
        }

        const [athletes, total] = await Promise.all([
            prisma.athlete.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    parent: { select: { id: true, name: true, email: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.athlete.count({ where }),
        ]);

        res.json({
            success: true,
            data: athletes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Get athletes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get athletes' });
    }
});

/**
 * GET /api/v1/athletes/my-children
 * Get athletes linked to current user as parent
 */
router.get('/my-children', async (req, res) => {
    try {
        const parentId = req.user?.id;

        const children = await prisma.athlete.findMany({
            where: { parentId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                club: { select: { id: true, name: true } },
                _count: { select: { scores: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: children });
    } catch (error) {
        console.error('Get my children error:', error);
        res.status(500).json({ success: false, message: 'Failed to get children' });
    }
});



// ... existing imports

/**
 * GET /api/v1/athletes/:id/gamification
 * Get gamification stats (XP, Level, Badges)
 */
router.get('/:id/gamification', async (req, res) => {
    try {
        const { id } = req.params;
        const athlete = await prisma.athlete.findUnique({
            where: { id },
            select: { xp: true, level: true }
        });

        if (!athlete) {
            return res.status(404).json({ success: false });
        }

        // Get earned badges
        const earnedBadges = await prisma.athleteBadge.findMany({
            where: { athleteId: id },
            include: { badge: true }
        });

        // Get all badges
        const allBadges = await prisma.badge.findMany();

        // Calculate Next Level XP
        const currentLevel = athlete.level;
        const nextLevelInfo = LEVELS.find(l => l.level === currentLevel + 1);
        const prevLevelInfo = LEVELS.find(l => l.level === currentLevel);

        const nextLevelXP = nextLevelInfo ? nextLevelInfo.xp : (currentLevel * 1000); // Fallback
        const prevLevelXP = prevLevelInfo ? prevLevelInfo.xp : 0;

        const badgesPayload = allBadges.map(b => {
            const earned = earnedBadges.find(eb => eb.badgeId === b.id);
            return {
                ...b,
                earnedAt: earned ? earned.earnedAt : undefined
            };
        });

        res.json({
            success: true,
            data: {
                xp: athlete.xp,
                level: athlete.level,
                nextLevelXP,
                prevLevelXP,
                badges: badgesPayload
            }
        });
    } catch (error) {
        console.error('Get gamification error:', error);
        res.status(500).json({ success: false, message: 'Failed to get gamification stats' });
    }
});

/**
 * GET /api/v1/athletes/:id
 * Get athlete by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const athlete = await prisma.athlete.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                parent: { select: { id: true, name: true, email: true, phone: true } },
                club: { select: { id: true, name: true } },
                scores: {
                    take: 10,
                    orderBy: { sessionDate: 'desc' },
                },
            },
        });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Athlete not found' });
            return;
        }

        res.json({ success: true, data: athlete });
    } catch (error) {
        console.error('Get athlete error:', error);
        res.status(500).json({ success: false, message: 'Failed to get athlete' });
    }
});

/**
 * POST /api/v1/athletes
 * Create new athlete
 */
router.post('/', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER'), async (req, res) => {
    try {
        const {
            userId, parentId, dateOfBirth, gender, archeryCategory,
            skillLevel, height, weight, bowBrand, bowModel, bowDrawWeight,
        } = req.body;

        const clubId = req.body.clubId || req.user!.clubId;

        if (!clubId) {
            res.status(400).json({ success: false, message: 'Club ID required' });
            return;
        }

        const athlete = await prisma.athlete.create({
            data: {
                userId,
                parentId,
                clubId,
                archeryCategory,
                skillLevel: skillLevel || 'BEGINNER',
                height: height ? parseFloat(height) : null,
                weight: weight ? parseFloat(weight) : null,
                bowBrand,
                bowModel,
                bowDrawWeight: bowDrawWeight ? parseFloat(bowDrawWeight) : null,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        res.status(201).json({ success: true, data: athlete });
    } catch (error) {
        console.error('Create athlete error:', error);
        res.status(500).json({ success: false, message: 'Failed to create athlete' });
    }
});

/**
 * PUT /api/v1/athletes/:id
 * Update athlete
 */
router.put('/:id', requireRoles('SUPER_ADMIN', 'CLUB', 'MANPOWER', 'ATHLETE'), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.userId;
        delete updateData.clubId;

        const athlete = await prisma.athlete.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        res.json({ success: true, data: athlete });
    } catch (error) {
        console.error('Update athlete error:', error);
        res.status(500).json({ success: false, message: 'Failed to update athlete' });
    }
});

/**
 * DELETE /api/v1/athletes/:id
 * Delete athlete
 */
router.delete('/:id', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        await prisma.athlete.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Athlete deleted' });
    } catch (error) {
        console.error('Delete athlete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete athlete' });
    }
});


/**
 * POST /api/v1/athletes/link-parent
 * Link parent to athlete using code
 */
router.post('/link-parent', requireRoles('PARENT'), async (req, res) => {
    try {
        const { code } = req.body;
        const parentId = req.user!.id;

        if (!code) {
            res.status(400).json({ success: false, message: 'Link code is required' });
            return;
        }

        const athlete = await prisma.athlete.findFirst({
            where: { parentLinkCode: code }
        });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Invalid link code' });
            return;
        }

        if (athlete.parentId) {
            res.status(400).json({ success: false, message: 'Athlete is already linked to a parent' });
            return;
        }

        // Link parent
        await prisma.athlete.update({
            where: { id: athlete.id },
            data: {
                parentId,
                parentLinkCode: null // Consume the code
            }
        });

        res.json({ success: true, message: 'Successfully linked to child' });
    } catch (error) {
        console.error('Link parent error:', error);
        res.status(500).json({ success: false, message: 'Failed to link parent' });
    }
});

/**
 * POST /api/v1/athletes/:id/generate-link-code
 * Generate parent link code
 */
router.post('/:id/generate-link-code', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        // Verify permissions: Athlete themselves, or Club Admin/Staff logic needs verification
        // For now, allow if user is the athlete's user account OR has higher privileges
        // Fetch athlete to verify ownership
        const athlete = await prisma.athlete.findUnique({ where: { id } });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Athlete not found' });
            return;
        }

        const isOwner = athlete.userId === userId;
        const isClubAdmin = ['SUPER_ADMIN', 'CLUB', 'MANPOWER'].includes(userRole);

        if (!isOwner && !isClubAdmin) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // Generate simple 6-char code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        await prisma.athlete.update({
            where: { id },
            data: { parentLinkCode: code }
        });

        res.json({ success: true, code });
    } catch (error) {
        console.error('Generate code error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate code' });
    }
});

/**
 * POST /api/v1/athletes/:id/unit
 * Update athlete unit assignment
 */
router.post('/:id/unit', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        const { id } = req.params;
        const { unitId } = req.body;
        const clubId = req.user?.clubId;

        const athlete = await prisma.athlete.findUnique({
            where: { id },
            select: { clubId: true }
        });

        if (!athlete) {
            return res.status(404).json({ success: false, message: 'Athlete not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN' && athlete.clubId !== clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Validate unit belongs to club if providing unitId
        if (unitId) {
            const unit = await prisma.clubUnit.findUnique({
                where: { id: unitId }
            });

            if (!unit || unit.clubId !== athlete.clubId) {
                return res.status(400).json({ success: false, message: 'Invalid unit for this club' });
            }
        }

        const updated = await prisma.athlete.update({
            where: { id },
            data: { unitId },
            include: {
                unit: { select: { name: true } }
            }
        });

        res.json({ success: true, data: updated, message: 'Unit assigned successfully' });
    } catch (error) {
        console.error('Update athlete unit error:', error);
        res.status(500).json({ success: false, message: 'Failed to update unit' });
    }
});

export default router;
