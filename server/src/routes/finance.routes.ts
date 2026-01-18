import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../middleware/rbac.middleware.js';

import prisma from '../lib/prisma.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/finance/payments
 * Get payment records
 */
router.get('/payments', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), requireClubAccess, async (req, res) => {
    try {
        const { status, billingPeriod, athleteId, page = 1, limit = 20 } = req.query;
        const clubId = req.user!.clubId;

        const where: any = {};
        if (clubId) where.athlete = { clubId };
        if (status) where.status = status;
        if (billingPeriod) where.billingPeriod = billingPeriod;
        if (athleteId) where.athleteId = athleteId;

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
            where: clubId ? { athlete: { clubId } } : {},
            _sum: { amount: true },
            _count: true,
        });

        res.json({
            success: true,
            data: payments,
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
router.post('/payments', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req, res) => {
    try {
        const { athleteId, description, amount, billingPeriod, dueDate } = req.body;

        const payment = await prisma.membershipFee.create({
            data: {
                athleteId,
                description,
                amount: parseFloat(amount),
                billingPeriod,
                dueDate: new Date(dueDate),
            },
        });

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create billing' });
    }
});

/**
 * PATCH /api/v1/finance/payments/:id
 * Update payment status (verify/reject)
 */
router.patch('/payments/:id', requireRoles('SUPER_ADMIN', 'CLUB_OWNER', 'STAFF'), async (req, res) => {
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
 * GET /api/v1/finance/summary
 * Get financial summary for dashboard
 */
router.get('/summary', requireRoles('SUPER_ADMIN', 'CLUB_OWNER'), async (req, res) => {
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
