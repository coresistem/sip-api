import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../middleware/rbac.middleware.js';

import prisma from '../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/finance/payments
 * Get payment records
 */
/**
 * GET /api/v1/finance/payments
 * Get payment records
 */
router.get('/payments', requireRoles('SUPER_ADMIN', 'CLUB', 'EO'), async (req, res) => {
    try {
        const { status, billingPeriod, athleteId, recipientId, page = 1, limit = 20 } = req.query;
        const user = req.user!;
        const clubId = user.clubId;

        const where: any = {};

        // Determine context: Club or EO
        const role = (user as any).role;
        if (role === 'CLUB' && clubId) {
            where.issuerId = clubId;
            where.issuerType = 'CLUB';
        } else if (role === 'EO') {
            where.issuerId = user.id;
            where.issuerType = 'EO';
        } else if (role === 'SUPER_ADMIN') {
            // Perpani sees all? Or acts as Perpani issuer?
            // If fetching *as* Issuer:
            where.issuerType = 'PERPANI';
        }

        if (status) where.status = status;
        if (billingPeriod) where.billingPeriod = billingPeriod;
        if (athleteId) where.athleteId = athleteId;
        if (recipientId) where.recipientId = recipientId;

        const [payments, total] = await Promise.all([
            prisma.membershipFee.findMany({
                where,
                include: {
                    athlete: { include: { user: { select: { name: true } } } },
                    verifier: { select: { name: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { dueDate: 'desc' },
            }),
            prisma.membershipFee.count({ where }),
        ]);

        // Calculate summary stats
        const stats = await prisma.membershipFee.groupBy({
            by: ['status'],
            where,
            _sum: { amount: true },
            _count: true,
        });

        // Enrich payments with recipient name if athlete is missing
        const enrichedPayments = await Promise.all(payments.map(async (p: any) => {
            if (p.athlete) return p;
            if (p.recipientId) {
                // Try to fetch user name or club name
                const userRec = await prisma.user.findUnique({ where: { id: p.recipientId }, select: { name: true, email: true } });
                const clubRec = !userRec ? await prisma.club.findUnique({ where: { id: p.recipientId }, select: { name: true } }) : null;
                return { ...p, recipientName: userRec?.name || clubRec?.name || 'Unknown' };
            }
            return p;
        }));

        res.json({
            success: true,
            data: enrichedPayments,
            stats,
            pagination: { page: Number(page), limit: Number(limit), total },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payments' });
    }
});

/**
 * POST /api/v1/finance/payments
 * Create billing record
 */
router.post('/payments', requireRoles('SUPER_ADMIN', 'CLUB', 'EO'), async (req, res) => {
    try {
        const { athleteId, recipientId, description, amount, billingPeriod, dueDate, saveAsTemplate, templateName, status } = req.body;
        const user = req.user!;

        // Determine Issuer
        let issuerId = '';
        let issuerType = 'CLUB';

        if ((user as any).role === 'CLUB' && user.clubId) {
            issuerId = user.clubId;
            issuerType = 'CLUB';
        } else if ((user as any).role === 'EO') {
            issuerId = user.id;
            issuerType = 'EO';
        } else if ((user as any).role === 'SUPER_ADMIN') {
            issuerId = 'PERPANI';
            issuerType = 'PERPANI';
        }

        if (!issuerId) {
            return res.status(400).json({ success: false, message: 'Could not determine issuer.' });
        }

        // Validate: must have athleteId OR recipientId
        if (!athleteId && !recipientId) {
            return res.status(400).json({ success: false, message: 'Must specify athleteId or recipientId' });
        }

        const payment = await prisma.membershipFee.create({
            data: {
                athleteId: athleteId || undefined,
                recipientId: recipientId || undefined,
                issuerId,
                issuerType,
                description,
                amount: parseFloat(amount),
                billingPeriod,
                dueDate: new Date(dueDate),
                status: status || 'PENDING', // Default to PENDING if not specified
            } as any,
        });

        // Save as template if requested
        if (saveAsTemplate && templateName) {
            await (prisma as any).invoiceTemplate.create({
                data: {
                    ownerId: issuerId, // Template belongs to Club or EO
                    name: templateName,
                    amount: parseFloat(amount),
                    items: JSON.stringify(req.body.items || []),
                    description: description,
                }
            });
        }

        // Create Notification for the recipient
        try {
            let targetUserId = '';

            if (athleteId) {
                // If athlete, get their User ID
                const athlete = await prisma.athlete.findUnique({
                    where: { id: athleteId },
                    select: { userId: true }
                });
                if (athlete) targetUserId = athlete.userId;
            } else if (recipientId) {
                // If direct recipient (User), use recipientId
                // If it's a Club, we might need to notify the owner, but for now assuming User recipient
                // We can check if recipientId exists in User table
                const userExists = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
                if (userExists) targetUserId = recipientId;
            }

            if (targetUserId) {
                await (prisma as any).notification.create({ // Cast to any if model not in generated types yet
                    data: {
                        userId: targetUserId,
                        title: 'New Invoice Received',
                        message: `You have received a new invoice for IDR ${amount.toLocaleString()}: ${description}`,
                        type: 'PAYMENT',
                        link: '/finance/payments', // Direct link to payments page
                        isRead: false
                    }
                });
            }
        } catch (error) {
            console.error('Failed to create notification:', error);
            // Don't fail the request if notification fails
        }

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create billing' });
    }
});

// ===========================================
// RECIPIENTS (Connections)
// ===========================================

router.get('/recipients', authenticate, async (req: any, res: Response) => {
    try {
        const user = (req as any).user!;
        const role = user.role;
        const query = (req.query as any).query as string || '';

        let recipients: any[] = [];

        if (role === 'CLUB' && user.clubId) {
            // Club: Athletes
            const athletes = await prisma.athlete.findMany({
                where: {
                    clubId: user.clubId,
                    user: { name: { contains: query } } // basic search
                },
                include: { user: { select: { name: true, email: true, id: true } } },
                take: 50
            });
            recipients = athletes.map(a => ({
                id: a.id, // Use AthleteID for internal consistency with old system, or switch to UserID?
                // The frontend currently uses AthleteID for 'member.id'.
                // Ideally we should use recipientId = UserID for consistency.
                // But for Athletes, system might expect athleteId link.
                // Let's return both.
                type: 'ATHLETE',
                name: a.user.name,
                email: a.user.email,
                athleteId: a.id,
                userId: a.user.id
            }));
        } else if (role === 'EO') {
            // EO: Past participants (Athletes)
            // Query Competitions -> Registrations -> Athletes
            // This is complex to query efficiently.
            // Simplified: Find all athletes (searchable) or those who registered to MY competitions.

            const myCompetitions = await (prisma as any).competition.findMany({
                where: { eoId: user.id },
                select: { id: true }
            });

            const compIds = myCompetitions.map((c: any) => c.id);

            const participants = await (prisma as any).competitionRegistration.findMany({
                where: {
                    competitionId: { in: compIds },
                    athlete: { user: { name: { contains: query } } }
                },
                select: {
                    athlete: {
                        select: {
                            id: true,
                            user: { select: { id: true, name: true, email: true } },
                            club: { select: { name: true } }
                        }
                    }
                },
                distinct: ['athleteId'],
                take: 50
            });

            recipients = participants.map((p: any) => ({
                id: p.athlete.user.id, // EO invoices User directly? RecipientId = UserID
                type: 'USER',
                name: p.athlete.user.name,
                email: p.athlete.user.email,
                subtext: p.athlete.club?.name,
                athleteId: p.athlete.id
            }));

        } else if (role === 'SUPER_ADMIN') {
            // Perpani: All Clubs and EOs
            // Simple search
            if (query) {
                const [clubs, eos] = await Promise.all([
                    prisma.club.findMany({ where: { name: { contains: query } }, take: 20 }),
                    prisma.user.findMany({ where: { role: 'EO', name: { contains: query } }, take: 20 })
                ]);

                recipients = [
                    ...clubs.map(c => ({ id: c.id, type: 'CLUB', name: c.name, email: c.email })),
                    ...eos.map(u => ({ id: u.id, type: 'EO', name: u.name, email: u.email }))
                ];
            }
        }

        // Supplier: Search all users?
        // TODO: specific Supplier logic

        res.json({ success: true, data: recipients });
    } catch (error) {
        console.error('Get recipients error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recipients' });
    }
});

/**
 * GET /api/v1/finance/templates
 * Get invoice templates
 */
router.get('/templates', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        const user = req.user!;
        let ownerId = '';

        if (user.role === 'CLUB' && user.clubId) {
            ownerId = user.clubId;
        } else {
            ownerId = user.id;
        }

        const templates = await (prisma as any).invoiceTemplate.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get templates' });
    }
});

/**
 * DELETE /api/v1/finance/templates/:id
 * Delete a template
 */
router.delete('/templates/:id', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        await (prisma as any).invoiceTemplate.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete template' });
    }
});

/**
 * PATCH /api/v1/finance/payments/:id
 * Update payment status (verify/reject)
 */
router.patch('/payments/:id', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        const updateData: any = { status };
        if (status === 'VERIFIED') {
            updateData.verifiedBy = req.user!.id;
            updateData.verifiedAt = new Date();
        }
        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const payment = await prisma.membershipFee.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json({ success: true, data: payment, message: `Payment ${status.toLowerCase()}` });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment' });
    }
});

/**
 * POST /api/v1/finance/payments/:id/proof
 * Upload payment proof (for Parents/Athletes)
 */
router.post('/payments/:id/proof', requireRoles('PARENT', 'ATHLETE'), async (req, res) => {
    try {
        const { paymentProofUrl, paymentMethod, transactionRef } = req.body;

        const payment = await prisma.membershipFee.update({
            where: { id: req.params.id },
            data: {
                paymentProofUrl,
                paymentMethod,
                transactionRef,
                transactionDate: new Date(),
                status: 'PAID',
            },
        });

        res.json({ success: true, data: payment, message: 'Payment proof uploaded' });
    } catch (error) {
        console.error('Upload proof error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload proof' });
    }
});

/**
 * GET /api/v1/finance/my-pending
 * Get pending/all payments for the logged-in user (Athlete/Parent)
 */
router.get('/my-pending', requireRoles('PARENT', 'ATHLETE'), async (req, res) => {
    try {
        const userId = req.user!.id;
        const userRole = (req.user as any).activeRole || 'ATHLETE';

        let athleteIds: string[] = [];

        if (userRole === 'ATHLETE') {
            const athlete = await prisma.athlete.findUnique({
                where: { userId }
            });
            if (athlete) athleteIds.push(athlete.id);
        } else if (userRole === 'PARENT') {
            const athletes = await prisma.athlete.findMany({
                where: { parentId: userId }
            });
            athleteIds = athletes.map(a => a.id);
        }

        if (athleteIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const payments = await prisma.membershipFee.findMany({
            where: {
                athleteId: { in: athleteIds }
                // Optionally filter by status if we strictly want "pending", but "my-pending" name implies it.
                // However, the frontend seems to map all statuses. Let's return all so they can see history.
            },
            include: {
                athlete: {
                    select: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { dueDate: 'desc' }
        });

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Get my payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payments' });
    }
});

/**
 * GET /api/v1/finance/summary
 * Get financial summary for dashboard
 */
router.get('/summary', requireRoles('SUPER_ADMIN', 'CLUB'), async (req, res) => {
    try {
        const clubId = req.user!.clubId;

        const [totalRevenue, pendingPayments, overdueCount] = await Promise.all([
            prisma.membershipFee.aggregate({
                where: { athlete: { clubId }, status: 'VERIFIED' },
                _sum: { amount: true },
            }),
            prisma.membershipFee.aggregate({
                where: { athlete: { clubId }, status: 'PENDING' },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.membershipFee.count({
                where: { athlete: { clubId }, status: 'OVERDUE' },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue._sum.amount || 0,
                pendingAmount: pendingPayments._sum.amount || 0,
                pendingCount: pendingPayments._count || 0,
                overdueCount,
            },
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to get summary' });
    }
});


/**
 * GET /api/v1/finance/my-pending
 * Get pending payments for the current user's linked children (Parent view)
 */
router.get('/my-pending', requireRoles('PARENT'), async (req, res) => {
    try {
        const parentId = req.user!.id;

        // 1. Find all children linked to this parent
        const children = await prisma.athlete.findMany({
            where: { parentId },
            select: { id: true }
        });

        const athleteIds = children.map(c => c.id);

        if (athleteIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 2. Find pending payments for these athletes
        const payments = await prisma.membershipFee.findMany({
            where: {
                athleteId: { in: athleteIds },
                status: 'PENDING'
            },
            include: {
                athlete: {
                    include: {
                        user: { select: { name: true, avatarUrl: true } }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Get my pending payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get pending payments' });
    }
});

export default router;
