import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rbac.middleware.js';
import crypto from 'crypto';

const router = Router();

// Helper to generate short validation code
const generateValidationCode = (): string => {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
};

// ===============================================
// AUTHENTICATED ROUTES (EO/Admin)
// ===============================================

router.use(authenticate);

/**
 * GET /api/v1/certificates/competition/:competitionId
 * Get all certificates for a competition
 */
router.get('/competition/:competitionId', requireRoles('EO', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { competitionId } = req.params;

        const certificates = await (prisma as any).certificate?.findMany({
            where: { competitionId },
            include: {
                competition: { select: { name: true, startDate: true } },
                athlete: { select: { id: true } }
            },
            orderBy: [{ category: 'asc' }, { rank: 'asc' }]
        }) || [];

        res.json({
            success: true,
            data: certificates
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to get certificates' });
    }
});

/**
 * POST /api/v1/certificates/generate
 * Generate certificate(s) for competition winners
 */
router.post('/generate', requireRoles('EO', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { competitionId, recipients } = req.body;

        // Validate input
        if (!competitionId || !recipients || !Array.isArray(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'competitionId and recipients array required'
            });
        }

        // Check competition exists
        const competition = await (prisma as any).competition?.findUnique({
            where: { id: competitionId }
        });

        if (!competition) {
            return res.status(404).json({ success: false, message: 'Competition not found' });
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const createdCerts = [];

        for (const recipient of recipients) {
            const validationCode = generateValidationCode();
            const validationUrl = `${baseUrl}/verify/${validationCode}`;

            // Determine template based on rank
            let templateType = 'DEFAULT';
            if (recipient.rank === 1) templateType = 'GOLD';
            else if (recipient.rank === 2) templateType = 'SILVER';
            else if (recipient.rank === 3) templateType = 'BRONZE';

            const cert = await (prisma as any).certificate?.create({
                data: {
                    competitionId,
                    recipientName: recipient.name,
                    recipientId: recipient.athleteId || null,
                    category: recipient.category,
                    achievement: recipient.achievement || (recipient.rank ? `${recipient.rank}${getOrdinalSuffix(recipient.rank)} Place` : 'Participant'),
                    rank: recipient.rank || null,
                    totalScore: recipient.score || null,
                    validationCode,
                    validationUrl,
                    templateType
                }
            });

            createdCerts.push(cert);
        }

        res.json({
            success: true,
            message: `${createdCerts.length} certificate(s) generated`,
            data: createdCerts
        });
    } catch (error) {
        console.error('Generate certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate certificates' });
    }
});

/**
 * POST /api/v1/certificates/generate-bulk/:competitionId
 * Auto-generate certificates from competition results
 */
router.post('/generate-bulk/:competitionId', requireRoles('EO', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { competitionId } = req.params;
        const { includeParticipants } = req.body; // Generate for all participants or just winners?

        const competition = await (prisma as any).competition?.findUnique({
            where: { id: competitionId },
            include: {
                registrations: {
                    include: {
                        athlete: {
                            include: { user: { select: { name: true } } }
                        },
                        category: { select: { name: true } }
                    },
                    orderBy: [
                        { categoryId: 'asc' },
                        { totalScore: 'desc' }
                    ]
                }
            }
        });

        if (!competition) {
            return res.status(404).json({ success: false, message: 'Competition not found' });
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const createdCerts = [];

        // Group registrations by category and assign ranks
        const categoryGroups: { [key: string]: any[] } = {};
        for (const reg of competition.registrations) {
            const catName = reg.category?.name || 'General';
            if (!categoryGroups[catName]) categoryGroups[catName] = [];
            categoryGroups[catName].push(reg);
        }

        for (const [categoryName, regs] of Object.entries(categoryGroups)) {
            // Sort by score descending
            regs.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

            for (let i = 0; i < regs.length; i++) {
                const reg = regs[i];
                const rank = i + 1;

                // Skip if only generating for winners (top 3)
                if (!includeParticipants && rank > 3) continue;

                const validationCode = generateValidationCode();
                const validationUrl = `${baseUrl}/verify/${validationCode}`;

                let templateType = 'DEFAULT';
                if (rank === 1) templateType = 'GOLD';
                else if (rank === 2) templateType = 'SILVER';
                else if (rank === 3) templateType = 'BRONZE';

                const cert = await (prisma as any).certificate?.create({
                    data: {
                        competitionId,
                        recipientName: reg.athlete?.user?.name || `Athlete ${reg.athleteId}`,
                        recipientId: reg.athleteId,
                        category: categoryName,
                        achievement: rank <= 3 ? `${rank}${getOrdinalSuffix(rank)} Place` : 'Participant',
                        rank: rank <= 3 ? rank : null,
                        totalScore: reg.totalScore,
                        validationCode,
                        validationUrl,
                        templateType
                    }
                });

                createdCerts.push(cert);
            }
        }

        res.json({
            success: true,
            message: `${createdCerts.length} certificate(s) generated`,
            data: createdCerts
        });
    } catch (error) {
        console.error('Bulk generate certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate certificates' });
    }
});

/**
 * GET /api/v1/certificates/:id
 * Get certificate details with QR info
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const certificate = await (prisma as any).certificate?.findUnique({
            where: { id },
            include: {
                competition: { select: { name: true, location: true, startDate: true, endDate: true } }
            }
        });

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to get certificate' });
    }
});

/**
 * DELETE /api/v1/certificates/:id
 * Delete a certificate
 */
router.delete('/:id', requireRoles('EO', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await (prisma as any).certificate?.delete({ where: { id } });

        res.json({ success: true, message: 'Certificate deleted' });
    } catch (error) {
        console.error('Delete certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete certificate' });
    }
});

// Helper function for ordinal suffix
function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

export default router;
