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

// ===========================================
// INVOICING ENDPOINTS
// ===========================================

/**
 * GET /api/v1/clubs/invoices
 * Get all invoices for the club
 */
router.get('/invoices', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;

        // Fetch membership fees as invoices
        const fees = await prisma.membershipFee.findMany({
            where: clubId ? {
                athlete: { clubId }
            } : {},
            include: {
                athlete: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to invoice format
        const invoices = fees.map((fee: any) => ({
            id: fee.id,
            invoiceNumber: `INV-${new Date(fee.createdAt).getFullYear()}-${String(fee.id).slice(-4).toUpperCase()}`,
            memberName: fee.athlete?.user?.name || 'Unknown',
            memberEmail: fee.athlete?.user?.email || '',
            description: fee.description,
            totalAmount: fee.amount,
            currency: fee.currency,
            status: fee.status,
            dueDate: fee.dueDate,
            paidAt: fee.transactionDate,
            items: [{ description: fee.description, quantity: 1, unitPrice: fee.amount, total: fee.amount }],
            createdAt: fee.createdAt
        }));

        res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ success: false, message: 'Failed to get invoices' });
    }
});

/**
 * POST /api/v1/clubs/invoices
 * Create a new invoice
 */
router.post('/invoices', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const { athleteId, description, amount, dueDate, items } = req.body;

        // Calculate total from items if provided
        const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.total || item.unitPrice * item.quantity), 0) || amount;

        const fee = await prisma.membershipFee.create({
            data: {
                athleteId,
                description: description || 'Club Invoice',
                amount: totalAmount,
                billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
                dueDate: new Date(dueDate),
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            data: {
                id: fee.id,
                invoiceNumber: `INV-${new Date().getFullYear()}-${String(fee.id).slice(-4).toUpperCase()}`
            }
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
});

/**
 * POST /api/v1/clubs/invoices/:id/send
 * Mark invoice as sent
 */
router.post('/invoices/:id/send', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.membershipFee.update({
            where: { id },
            data: { status: 'PENDING' } // SENT maps to PENDING in our model
        });

        res.json({ success: true, message: 'Invoice sent' });
    } catch (error) {
        console.error('Send invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to send invoice' });
    }
});

/**
 * POST /api/v1/clubs/invoices/:id/mark-paid
 * Mark invoice as paid
 */
router.post('/invoices/:id/mark-paid', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.membershipFee.update({
            where: { id },
            data: {
                status: 'PAID',
                transactionDate: new Date(),
                verifiedBy: req.user?.id,
                verifiedAt: new Date()
            }
        });

        res.json({ success: true, message: 'Invoice marked as paid' });
    } catch (error) {
        console.error('Mark paid error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark invoice as paid' });
    }
});

export default router;
