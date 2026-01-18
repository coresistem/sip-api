import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rbac.middleware.js';

const router = Router();

// Middleware: All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/clubs/member-requests
 * Get all pending member requests for the user's club
 */
router.get('/member-requests', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF', 'COACH'), async (req: Request, res: Response) => {
    try {
        let whereCondition: any = { status: 'PENDING' };

        // If not super admin, restrict to own club
        if (req.user?.role !== 'SUPER_ADMIN') {
            if (!req.user?.clubId) {
                return res.status(400).json({ success: false, message: 'User does not belong to a club' });
            }
            whereCondition.clubId = req.user.clubId;
        }

        // We use cast to any to bypass TS error for pending migration
        const requests = await (prisma as any).clubJoinRequest.findMany({
            where: whereCondition,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to frontend format
        const data = requests.map((req: any) => ({
            id: req.id,
            user: req.user,
            requestType: req.role,
            athleteData: {
                archeryCategory: 'Unknown',
                skillLevel: 'Unknown'
            },
            createdAt: req.createdAt,
            status: req.status,
            notes: req.notes
        }));

        res.json(data);
    } catch (error) {
        console.error('Get member requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to get member requests' });
    }
});

/**
 * POST /api/v1/clubs/member-requests/:id/approve
 * Approve a member request
 */
router.post('/member-requests/:id/approve', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const request = await (prisma as any).clubJoinRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        await prisma.$transaction(async (tx: any) => {
            // 1. Update request
            await tx.clubJoinRequest.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            // 2. If Athlete, ensure Athlete profile exists
            if (request.role === 'ATHLETE') {
                // Check if athlete profile exists
                const existing = await tx.athlete.findFirst({ where: { userId: request.userId } });
                if (!existing) {
                    await tx.athlete.create({
                        data: {
                            userId: request.userId,
                            clubId: request.clubId,
                            name: request.user.name || 'New Athlete',
                            gender: 'MALE',
                            dateOfBirth: new Date(),
                        }
                    });
                }
            }
        });

        res.json({ success: true, message: 'Request approved' });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
});

/**
 * POST /api/v1/clubs/member-requests/:id/reject
 * Reject a member request
 */
router.post('/member-requests/:id/reject', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await (prisma as any).clubJoinRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                notes: notes
            }
        });

        res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});

export default router;
