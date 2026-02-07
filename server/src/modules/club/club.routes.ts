import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { notificationService } from '../core/notification/notification.service.js';

const router = Router();

// Middleware: All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/clubs/stats
 * Get club dashboard statistics
 */
router.get('/stats', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;

        if (!clubId) {
            return res.status(400).json({ success: false, message: 'User does not belong to a club' });
        }

        const [
            totalMembers,
            activeSchedules,
            pendingApprovals,
            monthlyRevenue,
            recentMembers
        ] = await Promise.all([
            // Total Members (Athletes in the club)
            prisma.athlete.count({
                where: { clubId }
            }),
            // Active Schedules
            prisma.trainingSchedule.count({
                where: {
                    clubId,
                    status: { not: 'COMPLETED' }
                }
            }),
            // Pending Member Approvals
            prisma.clubJoinRequest.count({
                where: {
                    clubId,
                    status: 'PENDING'
                }
            }),
            // Monthly Revenue (Current Month)
            prisma.membershipFee.aggregate({
                where: {
                    athlete: { clubId },
                    // status: 'PAID', // Optional: only count paid? Or all generated for potential revenue? Usually revenue means paid.
                    // Let's stick to total generated invoices for now or strictly paid.
                    // Dashboard usually shows "Revenue" as actual income.
                    status: { in: ['PAID', 'VERIFIED'] },
                    transactionDate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                    }
                },
                _sum: { amount: true }
            }),
            prisma.athlete.findMany({
                where: { clubId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        res.json({
            success: true,
            data: {
                totalMembers,
                activeSchedules,
                pendingApprovals,
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                recentMembers
            }
        });

    } catch (error) {
        console.error('Get club stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get club stats' });
    }
});

// ===========================================
// CLUB PROFILE ENDPOINTS
// ===========================================

/**
 * GET /api/v1/clubs/profile
 * Get club details (settings)
 */
router.get('/profile', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;
        if (!clubId) return res.status(400).json({ success: false, message: 'No club assigned' });

        const club = await prisma.club.findUnique({
            where: { id: clubId }
        });

        res.json({ success: true, data: club });
    } catch (error) {
        console.error('Get club profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to get club profile' });
    }
});

/**
 * PUT /api/v1/clubs/profile
 * Update club details
 */
router.put('/profile', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;
        if (!clubId) return res.status(400).json({ success: false, message: 'No club assigned' });

        const { address, city, province, postalCode, phone, email, website, description, logoUrl } = req.body;

        const club = await prisma.club.update({
            where: { id: clubId },
            data: {
                address, city, province, postalCode, phone, email, website, description, logoUrl
            }
        });

        res.json({ success: true, data: club, message: 'Club profile updated' });
    } catch (error) {
        console.error('Update club profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update club profile' });
    }
});

// ===========================================
// INVOICING ENDPOINTS
// ===========================================

/**
 * GET /api/v1/clubs/invoices
 * Get all invoices for the club
 */
router.get('/invoices', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
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
            member: {
                id: fee.athleteId,
                name: fee.athlete?.user?.name || 'Unknown',
                email: fee.athlete?.user?.email || ''
            },
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
 * Create new invoice(s)
 * Supports single creation (athleteId string) or bulk (athleteIds array)
 */
router.post('/invoices', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const { athleteId, athleteIds, description, amount, dueDate, items } = req.body;

        // Calculate total from items if provided
        const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.total || item.unitPrice * item.quantity), 0) || amount;

        // Determine targets: single or multiple
        const targets: string[] = athleteIds || (athleteId ? [athleteId] : []);

        if (targets.length === 0) {
            return res.status(400).json({ success: false, message: 'No athletes selected' });
        }

        const billingPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
        const createData = targets.map(id => ({
            athleteId: id,
            description: description || 'Club Invoice',
            amount: totalAmount,
            billingPeriod,
            dueDate: new Date(dueDate),
            status: req.body.status || 'PENDING'
        }));

        // Bulk create
        await prisma.membershipFee.createMany({
            data: createData
        });

        res.status(201).json({
            success: true,
            message: `${targets.length} invoice(s) created`
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice(s)' });
    }
});

/**
 * POST /api/v1/clubs/invoices/:id/send
 * Mark invoice as sent
 */
router.post('/invoices/:id/send', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
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
router.post('/invoices/:id/mark-paid', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
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

// ===========================================
// MEMBER MANAGEMENT ENDPOINTS
// ===========================================

/**
 * GET /api/v1/clubs/members
 * Get all members (athletes) of the club
 */
router.get('/members', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;

        const athletes = await prisma.athlete.findMany({
            where: clubId ? { clubId } : {},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        phone: true
                    }
                },
                _count: {
                    select: { scores: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: athletes });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ success: false, message: 'Failed to get members' });
    }
});

/**
 * GET /api/v1/clubs/member-requests
 * Get all pending join requests
 */
router.get('/member-requests', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;

        const requests = await prisma.clubJoinRequest.findMany({
            where: {
                clubId,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enhance requests with potential athlete data if available
        const enhancedRequests = await Promise.all(requests.map(async (req) => {
            let athleteData = null;
            if (req.role === 'ATHLETE') {
                const athlete = await prisma.athlete.findUnique({
                    where: { userId: req.userId }
                });
                if (athlete) {
                    athleteData = {
                        archeryCategory: athlete.archeryCategory,
                        skillLevel: athlete.skillLevel,
                        dateOfBirth: (athlete as any).user?.dateOfBirth // athlete is fetched with user in include above
                    };
                }
            }
            return {
                ...req,
                requestType: req.role, // Map 'role' to 'requestType' for frontend compatibility
                athleteData
            };
        }));

        res.json({ success: true, data: enhancedRequests });
    } catch (error) {
        console.error('Get member requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to get member requests' });
    }
});

/**
 * POST /api/v1/clubs/member-requests/:id/approve
 * Approve a member request
 */
router.post('/member-requests/:id/approve', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clubId = req.user?.clubId;

        const request = await prisma.clubJoinRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.clubId !== clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Transaction to approve request and update user/athlete
        await prisma.$transaction(async (tx) => {
            // 1. Update request status
            await tx.clubJoinRequest.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            // 2. Update User (link to club)
            await tx.user.update({
                where: { id: request.userId },
                data: {
                    clubId: request.clubId,
                    // Optionally set role active? 
                    // activeRole: request.role // Maybe don't force switch
                }
            });

            // 3. If Athlete, update Athlete record
            if (request.role === 'ATHLETE') {
                // Check if athlete record exists
                const athlete = await tx.athlete.findUnique({
                    where: { userId: request.userId }
                });

                if (athlete) {
                    await tx.athlete.update({
                        where: { id: athlete.id },
                        data: { clubId: request.clubId }
                    });
                } else {
                    // Create basic athlete record
                    await tx.athlete.create({
                        data: {
                            user: { connect: { id: request.userId } },
                            club: { connect: { id: request.clubId } },
                            archeryCategory: 'RECURVE', // Default
                            skillLevel: 'BEGINNER'
                        }
                    });
                }
            }
        });

        // 4. Notify User
        const club = await prisma.club.findUnique({
            where: { id: request.clubId },
            select: { name: true }
        });
        await notificationService.notifyIntegrationDecision(
            request.userId,
            club?.name || 'the club',
            'APPROVED'
        );

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
router.post('/member-requests/:id/reject', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const clubId = req.user?.clubId;

        const request = await prisma.clubJoinRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.clubId !== clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.clubJoinRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                notes: notes
            }
        });

        // Notify User
        const club = await prisma.club.findUnique({
            where: { id: request.clubId },
            select: { name: true }
        });
        await notificationService.notifyIntegrationDecision(
            request.userId,
            club?.name || 'the club',
            'REJECTED',
            notes
        );

        res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});

// ===========================================
// AUDIT & SECURITY ENDPOINTS
// ===========================================

/**
 * GET /api/v1/clubs/audit-log
 * Get club audit log (security events for the last 30 days)
 */
router.get('/audit-log', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;
        if (!clubId) {
            return res.status(400).json({ success: false, message: 'No club assigned' });
        }

        // Get club members' user IDs for filtering
        const clubMembers = await prisma.athlete.findMany({
            where: { clubId },
            select: { userId: true }
        });
        const memberUserIds = clubMembers.map(m => m.userId);

        // Get club owner ID
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: { ownerId: true }
        });

        const allRelevantUserIds = club ? [...memberUserIds, club.ownerId] : memberUserIds;

        // Fetch audit logs for club-related actions in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const auditLogs = await (prisma.auditLog as any).findMany({
            where: {
                OR: [
                    // Logs by club members/owner
                    { userId: { in: allRelevantUserIds } },
                    // Logs related to the club entity
                    { entity: 'Club', entityId: clubId },
                    // Logs related to club athletes
                    { entity: 'Athlete', entityId: { in: memberUserIds } }
                ],
                createdAt: { gte: thirtyDaysAgo }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        res.json({
            success: true,
            data: (auditLogs as any[]).map((log: any) => ({
                id: log.id,
                action: log.action,
                entity: log.entity,
                entityId: log.entityId,
                user: log.user,
                metadata: log.metadata ? JSON.parse(log.metadata) : null,
                ipAddress: log.ipAddress,
                createdAt: log.createdAt
            }))
        });
    } catch (error) {
        console.error('Get audit log error:', error);
        res.status(500).json({ success: false, message: 'Failed to get audit log' });
    }
});

/**
 * POST /api/v1/clubs/members/:userId/unlink
 * Remove a member from the club (with audit trail)
 */
router.post('/members/:userId/unlink', requireRoles('SUPER_ADMIN', 'CLUB'), async (req: Request, res: Response) => {
    try {
        const clubId = req.user?.clubId;
        const { userId } = req.params;
        const { reason } = req.body;

        if (!clubId) {
            return res.status(400).json({ success: false, message: 'No club assigned' });
        }

        // Find the athlete record
        const athlete = await prisma.athlete.findFirst({
            where: { userId, clubId },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!athlete) {
            return res.status(404).json({ success: false, message: 'Member not found in this club' });
        }

        // Get club name for audit
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: { name: true }
        });

        // Unlink athlete from club
        await prisma.$transaction([
            // 1. Remove club association from Athlete
            prisma.athlete.update({
                where: { id: athlete.id },
                data: { clubId: null }
            }),
            // 2. Update user's clubId
            prisma.user.update({
                where: { id: userId },
                data: { clubId: null }
            }),
            // 3. AUTO-REVOCATION: Revoke P2P Handshake (TTL)
            // When leaving a club, the club LOSES access to the athlete's raw docs.
            prisma.entityIntegrationRequest.updateMany({
                where: {
                    userId,
                    targetEntityId: clubId,
                    status: 'APPROVED'
                },
                data: {
                    status: 'REVOKED',
                    notes: `Revoked due to unlinking: ${reason || 'No reason provided'}`
                }
            }),
            // 4. Create audit log
            prisma.auditLog.create({
                data: {
                    userId: req.user!.id,
                    action: 'MEMBER_UNLINKED',
                    entity: 'Athlete',
                    entityId: athlete.id,
                    oldValues: JSON.stringify({ clubId, clubName: club?.name }),
                    newValues: JSON.stringify({ clubId: null }),
                    metadata: JSON.stringify({
                        unlinkReason: reason || 'No reason provided',
                        memberName: athlete.user.name,
                        memberEmail: athlete.user.email,
                        handshakeRevoked: true
                    })
                }
            })
        ]);

        // Notify the unlinked member
        await notificationService.notifyIntegrationDecision(
            userId,
            club?.name || 'the club',
            'REJECTED',
            reason || 'You have been removed from the club'
        );

        res.json({ success: true, message: 'Member successfully unlinked from club' });
    } catch (error) {
        console.error('Unlink member error:', error);
        res.status(500).json({ success: false, message: 'Failed to unlink member' });
    }
});

export default router;
