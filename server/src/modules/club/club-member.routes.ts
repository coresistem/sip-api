import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireClubAccess } from '../../middleware/rbac.middleware.js';
import prisma from '../../lib/prisma.js';

const router = Router();

router.use(authenticate);
router.use(requireClubAccess); // All routes require club access (Owner/Admin)

/**
 * GET /api/v1/clubs/members
 * Get list of club members (Athletes)
 */
router.get('/', async (req, res) => {
    try {
        const { clubId } = req.user!;
        const { search, category, status } = req.query;

        const where: any = {
            clubId: clubId,
            // If we have a status 'ACTIVE' vs 'ARCHIVED' for athletes, generic query for now
        };

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                ]
            };
        }

        if (category) {
            where.archeryCategory = category;
        }

        const members = await prisma.athlete.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        phone: true,
                        cityId: true
                    }
                },
                _count: {
                    select: {
                        scores: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Get club members error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
});

/**
 * GET /api/v1/clubs/members/requests
 * Get pending join requests
 */
router.get('/requests', async (req, res) => {
    try {
        const { clubId } = req.user!;

        const requests = await prisma.clubJoinRequest.findMany({
            where: {
                clubId: clubId,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get join requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch join requests' });
    }
});

/**
 * POST /api/v1/clubs/members/requests/:id/approve
 * Approve a join request
 */
router.post('/requests/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { clubId } = req.user!;

        const request = await prisma.clubJoinRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!request || request.clubId !== clubId) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
        }

        if (request.status !== 'PENDING') {
            res.status(400).json({ success: false, message: 'Request already processed' });
            return;
        }

        // Transaction to approve request and create/link Athlete
        await prisma.$transaction(async (tx) => {
            // 1. Update Request Status
            await tx.clubJoinRequest.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            // 2. Check if user already has an Athlete profile
            const existingAthlete = await tx.athlete.findUnique({
                where: { userId: request.userId }
            });

            if (existingAthlete) {
                // If exists, update clubId
                await tx.athlete.update({
                    where: { id: existingAthlete.id },
                    data: { clubId: clubId }
                });
            } else {
                // If not, create new Athlete profile
                await tx.athlete.create({
                    data: {
                        userId: request.userId,
                        clubId: clubId,
                        // Default values
                        archeryCategory: 'RECURVE',
                        skillLevel: 'BEGINNER'
                    }
                });
            }

            // 3. Update User's main clubId link
            await tx.user.update({
                where: { id: request.userId },
                data: { clubId: clubId }
            });
        });

        res.json({ success: true, message: 'Member Approved' });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
});

/**
 * POST /api/v1/clubs/members/requests/:id/reject
 * Reject a join request
 */
router.post('/requests/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { clubId } = req.user!;

        const request = await prisma.clubJoinRequest.findUnique({ where: { id } });

        if (!request || request.clubId !== clubId) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
        }

        if (request.status !== 'PENDING') {
            res.status(400).json({ success: false, message: 'Request already processed' });
            return;
        }

        await prisma.clubJoinRequest.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        res.json({ success: true, message: 'Request Rejected' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});


export default router;
