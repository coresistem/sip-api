import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rbac.middleware.js';

const router = Router();

// Middleware: All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/judge/events
 * Get events assigned to this judge or all events for super admin
 */
router.get('/events', requireRoles('JUDGE', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        // For now, get all open events
        const events = await (prisma as any).event?.findMany({
            where: {
                status: { in: ['OPEN', 'REGISTRATION_CLOSED'] }
            },
            orderBy: { startDate: 'asc' },
            take: 20
        }).catch(() => []) || [];

        const data = events.map((event: any) => ({
            id: event.id,
            name: event.name,
            date: event.startDate?.toISOString().split('T')[0],
            venue: event.venue || 'TBD',
            status: event.status,
            // Mock assignment status for now
            assignmentStatus: 'PENDING'
        }));

        res.json(data);
    } catch (error) {
        console.error('Get judge events error:', error);
        res.status(500).json({ success: false, message: 'Failed to get events' });
    }
});

/**
 * POST /api/v1/judge/events/:id/accept
 * Accept event assignment
 */
router.post('/events/:id/accept', requireRoles('JUDGE', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // For now, just return success (would need JudgeAssignment model)
        res.json({ success: true, message: 'Event assignment accepted', eventId: id });
    } catch (error) {
        console.error('Accept event error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept event' });
    }
});

/**
 * POST /api/v1/judge/events/:id/decline
 * Decline event assignment
 */
router.post('/events/:id/decline', requireRoles('JUDGE', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        res.json({ success: true, message: 'Event assignment declined', eventId: id, reason });
    } catch (error) {
        console.error('Decline event error:', error);
        res.status(500).json({ success: false, message: 'Failed to decline event' });
    }
});

/**
 * GET /api/v1/judge/disputes
 * Get score disputes for review
 */
router.get('/disputes', requireRoles('JUDGE', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        // Get scoring records that might have disputes
        // For now return sample data structure - would need a Dispute model
        const disputes: any[] = [];

        res.json(disputes);
    } catch (error) {
        console.error('Get disputes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get disputes' });
    }
});

/**
 * POST /api/v1/judge/disputes/:id/resolve
 * Resolve a score dispute
 */
router.post('/disputes/:id/resolve', requireRoles('JUDGE', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { decision, adjustedScore, notes } = req.body;

        res.json({
            success: true,
            message: 'Dispute resolved',
            disputeId: id,
            decision,
            adjustedScore,
            notes
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve dispute' });
    }
});

/**
 * GET /api/v1/judge/certifications
 * Get judge certifications
 */
router.get('/certifications', requireRoles('JUDGE', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        // Return certification data for the logged-in user
        const userId = req.user?.id;

        // For now, return mock certification structure
        // Would need a JudgeCertification model
        const certifications = userId ? [
            {
                id: '1',
                level: 'REGIONAL',
                issueDate: '2025-01-01',
                expiryDate: '2027-12-31',
                status: 'ACTIVE',
                issuedBy: 'PERPANI'
            }
        ] : [];

        res.json(certifications);
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to get certifications' });
    }
});

/**
 * GET /api/v1/judge/stats
 * Get judge dashboard statistics
 */
router.get('/stats', requireRoles('JUDGE', 'SUPER_ADMIN'), async (_req: Request, res: Response) => {
    try {
        const totalEvents = await (prisma as any).event?.count({
            where: { status: { in: ['OPEN', 'REGISTRATION_CLOSED'] } }
        }).catch(() => 0) || 0;

        res.json({
            assignedEvents: 0,
            pendingAssignments: totalEvents,
            completedEvents: 0,
            disputesResolved: 0
        });
    } catch (error) {
        console.error('Get judge stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

export default router;
