import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';

const router = Router();

// Role codes for CORE ID generation
const ROLE_CODES: Record<string, string> = {
    'SUPER_ADMIN': '00',
    'PERPANI': '01',
    'CLUB': '02',
    'SCHOOL': '03',
    'ATHLETE': '04',
    'PARENT': '05',
    'COACH': '06',
    'JUDGE': '07',
    'EO': '08',
    'SUPPLIER': '09',
    'MANPOWER': '10',
};

// Status options for roles
const ROLE_STATUS_OPTIONS = ['Active', 'Suspended', 'Pending', 'Inactive', 'Disable', 'Blocked'];

// Validation schemas
const submitRoleRequestSchema = z.object({
    body: z.object({
        requestedRole: z.string(),
        nik: z.string().length(16, "NIK must be 16 characters"),
        nikDocumentUrl: z.string().optional(),
        certDocumentUrl: z.string().optional(),
    }),
});

// Helper: Generate CORE ID for a role
async function generateCoreIdForRole(role: string, cityId: string): Promise<string> {
    const roleCode = ROLE_CODES[role] || '04';

    // Count existing users with this role in this city
    const count = await prisma.user.count({
        where: {
            cityId,
            OR: [
                { role },
                { roles: { contains: role } }
            ]
        }
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${roleCode}-${cityId}-${sequence}`;
}

// POST /api/v1/role-requests - Submit a role request
router.post('/', authenticate, validate(submitRoleRequestSchema), async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { requestedRole, nik, nikDocumentUrl, certDocumentUrl } = req.body;

        // ... (existing user check)

        // Create role request
        const roleRequest = await prisma.roleRequest.create({
            data: {
                userId,
                requestedRole,
                nik,
                nikDocumentUrl,
                certDocumentUrl,
                status: 'PENDING',
            }
        });


        res.status(201).json({
            success: true,
            message: 'Pengajuan Anda akan dipertimbangkan',
            data: roleRequest
        });
    } catch (error) {
        console.error('Submit role request error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit role request' });
    }
});

// GET /api/v1/role-requests - Get user's role requests
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const requests = await prisma.roleRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get role requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch role requests' });
    }
});

// GET /api/v1/role-requests/pending - Admin: Get all pending requests
router.get('/pending', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'PERPANI') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const requests = await prisma.roleRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, nik: true, nikVerified: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
    }
});

// PATCH /api/v1/role-requests/:id/approve - Approve a role request
router.patch('/:id/approve', authenticate, async (req: Request, res: Response) => {
    try {
        const adminUser = (req as any).user;
        if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'PERPANI') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { id } = req.params;

        // Get the request
        const roleRequest = await prisma.roleRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!roleRequest) {
            return res.status(404).json({ success: false, message: 'Role request not found' });
        }

        if (roleRequest.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request already processed' });
        }

        const user = roleRequest.user;
        const { requestedRole } = roleRequest;

        // Generate CORE ID for new role
        const newCoreId = await generateCoreIdForRole(requestedRole, user.cityId || '0000');

        // Parse existing arrays/maps
        const roles = user.roles ? JSON.parse(user.roles) : [user.role];
        const coreIds = user.coreIds ? JSON.parse(user.coreIds) : { [user.role]: user.coreId };
        const roleStatuses = user.roleStatuses ? JSON.parse(user.roleStatuses) : { [user.role]: 'Active' };

        // Add new role
        if (!roles.includes(requestedRole)) {
            roles.push(requestedRole);
        }
        coreIds[requestedRole] = newCoreId;
        roleStatuses[requestedRole] = 'Active';

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                roles: JSON.stringify(roles),
                coreIds: JSON.stringify(coreIds),
                roleStatuses: JSON.stringify(roleStatuses),
                nikVerified: true, // Mark NIK as verified
            }
        });

        // Update request
        await prisma.roleRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                generatedCoreId: newCoreId,
                reviewedBy: adminUser.id,
                reviewedAt: new Date(),
            }
        });

        res.json({
            success: true,
            message: 'Role request approved',
            data: { newCoreId, role: requestedRole }
        });
    } catch (error) {
        console.error('Approve role request error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
});

// PATCH /api/v1/role-requests/:id/reject - Reject a role request
router.patch('/:id/reject', authenticate, async (req: Request, res: Response) => {
    try {
        const adminUser = (req as any).user;
        if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'PERPANI') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { id } = req.params;
        const { reason } = req.body;

        const roleRequest = await prisma.roleRequest.findUnique({ where: { id } });

        if (!roleRequest) {
            return res.status(404).json({ success: false, message: 'Role request not found' });
        }

        if (roleRequest.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request already processed' });
        }

        await prisma.roleRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason || 'Request rejected by admin',
                reviewedBy: adminUser.id,
                reviewedAt: new Date(),
            }
        });

        res.json({ success: true, message: 'Role request rejected' });
    } catch (error) {
        console.error('Reject role request error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});

export default router;
