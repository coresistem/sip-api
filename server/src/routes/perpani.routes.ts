import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rbac.middleware.js';

const router = Router();

// Middleware: All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/perpani/club-requests
 * Get all clubs pending Perpani approval
 */
router.get('/club-requests', requireRoles('PERPANI', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const clubs = await prisma.club.findMany({
            where: {
                isPerpaniMember: false
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to frontend format
        const data = clubs.map(club => ({
            id: club.id,
            clubName: club.name,
            location: club.city || club.province || 'Indonesia',
            ownerName: club.owner?.name || 'Unknown',
            ownerEmail: club.owner?.email || '',
            memberCount: club._count.members,
            documents: club.skPerpaniDocId ? [club.skPerpaniDocId] : [],
            status: 'PENDING',
            submittedAt: club.createdAt.toISOString()
        }));

        res.json(data);
    } catch (error) {
        console.error('Get club requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to get club requests' });
    }
});

/**
 * POST /api/v1/perpani/club-requests/:id/approve
 * Approve a club's Perpani registration
 */
router.post('/club-requests/:id/approve', requireRoles('PERPANI', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { skPerpaniNo } = req.body;

        const club = await prisma.club.findUnique({ where: { id } });
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }

        await prisma.club.update({
            where: { id },
            data: {
                isPerpaniMember: true,
                skPerpaniNo: skPerpaniNo || `SK-${Date.now()}`
            }
        });

        res.json({ success: true, message: 'Club approved and registered with Perpani' });
    } catch (error) {
        console.error('Approve club error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve club' });
    }
});

/**
 * POST /api/v1/perpani/club-requests/:id/reject
 * Reject a club's Perpani registration
 */
router.post('/club-requests/:id/reject', requireRoles('PERPANI', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const club = await prisma.club.findUnique({ where: { id } });
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }

        // Set status to SUSPENDED to indicate rejection
        await prisma.club.update({
            where: { id },
            data: {
                status: 'SUSPENDED'
            }
        });

        res.json({ success: true, message: 'Club registration rejected', notes });
    } catch (error) {
        console.error('Reject club error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject club' });
    }
});

/**
 * GET /api/v1/perpani/stats
 * Get regional statistics for Perpani dashboard
 */
router.get('/stats', requireRoles('PERPANI', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        const [totalClubs, totalAthletes, pendingClubs, activeEvents] = await Promise.all([
            prisma.club.count({ where: { isPerpaniMember: true } }),
            prisma.athlete.count(),
            prisma.club.count({ where: { isPerpaniMember: false } }),
            (prisma as any).event?.count({ where: { status: 'OPEN' } }).catch(() => 0) || 0
        ]);

        res.json({
            success: true,
            data: {
                totalClubs,
                totalAthletes,
                activeCompetitions: activeEvents,
                pendingApprovals: pendingClubs
            }
        });
    } catch (error) {
        console.error('Get perpani stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

/**
 * GET /api/v1/perpani/clubs
 * Get all registered Perpani member clubs
 */
router.get('/clubs', requireRoles('PERPANI', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const clubs = await prisma.club.findMany({
            where: { isPerpaniMember: true },
            include: {
                _count: { select: { members: true } }
            },
            orderBy: { name: 'asc' }
        });

        const data = clubs.map(club => ({
            id: club.id,
            name: club.name,
            location: club.city || club.province || 'Indonesia',
            memberCount: club._count.members,
            status: club.status
        }));

        res.json(data);
    } catch (error) {
        console.error('Get perpani clubs error:', error);
        res.status(500).json({ success: false, message: 'Failed to get clubs' });
    }
});

/**
 * GET /api/v1/perpani/events
 * Get upcoming events under Perpani jurisdiction
 */
router.get('/events', requireRoles('PERPANI', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        const events = await (prisma as any).event?.findMany({
            where: {
                startDate: { gte: new Date() }
            },
            include: {
                _count: { select: { registrations: true } }
            },
            orderBy: { startDate: 'asc' },
            take: 10
        }).catch(() => []);

        const data = events.map((event: any) => ({
            id: event.id,
            name: event.name,
            date: event.startDate?.toISOString(),
            location: event.venue || 'TBD',
            participantCount: event._count?.registrations || 0
        }));

        res.json(data);
    } catch (error) {
        console.error('Get perpani events error:', error);
        res.status(500).json({ success: false, message: 'Failed to get events' });
    }
});

/**
 * GET /api/v1/perpani/licensing/stats
 * Get licensing statistics
 */
router.get('/licensing/stats', requireRoles('PERPANI', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        // Count all athletes (proxy for KTA)
        const totalKTA = await prisma.athlete.count();

        // Count coaches with STTKO (verified coaches)
        const totalSTTKO = await (prisma as any).coach?.count({
            where: { verificationStatus: 'VERIFIED' }
        }).catch(() => 0) || 0;

        res.json({
            totalKTA,
            totalSTTKO,
            pendingApprovals: 0,
            expiringThisMonth: 0
        });
    } catch (error) {
        console.error('Get licensing stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get licensing stats' });
    }
});

/**
 * GET /api/v1/perpani/licenses
 * Get all licenses (KTA and STTKO)
 */
router.get('/licenses', requireRoles('PERPANI', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        // Get athletes as KTA holders
        const athletes = await prisma.athlete.findMany({
            include: {
                user: { select: { name: true } },
                club: { select: { name: true } }
            },
            take: 50
        });

        const ktaLicenses = athletes.map((a: any) => ({
            id: a.id,
            type: 'KTA',
            holderName: a.user?.name || a.name || 'Unknown',
            holderType: 'ATHLETE',
            clubName: a.club?.name || 'Unknown',
            licenseNumber: `KTA-${new Date().getFullYear()}-${a.id.slice(-6).toUpperCase()}`,
            issueDate: a.createdAt?.toISOString().split('T')[0] || '',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'ACTIVE'
        }));

        // Get verified coaches as STTKO holders
        const coaches = await (prisma as any).coach?.findMany({
            where: { verificationStatus: 'VERIFIED' },
            include: {
                user: { select: { name: true, clubId: true } }
            },
            take: 20
        }).catch(() => []) || [];

        const sttkoLicenses = coaches.map((c: any) => ({
            id: c.id,
            type: 'STTKO',
            holderName: c.user?.name || 'Unknown',
            holderType: 'COACH',
            clubName: 'Unknown',
            licenseNumber: `STTKO-${c.certificateLevel || 'I'}-${c.id.slice(-6)}`,
            issueDate: c.verifiedAt?.toISOString().split('T')[0] || '',
            expiryDate: '',
            status: 'ACTIVE'
        }));

        res.json([...ktaLicenses, ...sttkoLicenses]);
    } catch (error) {
        console.error('Get licenses error:', error);
        res.status(500).json({ success: false, message: 'Failed to get licenses' });
    }
});

export default router;
