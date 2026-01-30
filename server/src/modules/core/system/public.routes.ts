import { Router, Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';
import * as publicController from './public.controller.js';

const router = Router();

// Public CORE ID verification endpoint
router.get('/verify/:coreId', publicController.verifyCoreId);

/**
 * GET /api/v1/public/certificates/verify/:code
 * Public endpoint to verify a certificate via QR code
 */
router.get('/certificates/verify/:code', async (req: Request, res: Response) => {
    try {
        const { code } = req.params;

        const certificate = await (prisma as any).certificate?.findUnique({
            where: { validationCode: code },
            include: {
                competition: {
                    select: {
                        name: true,
                        location: true,
                        city: true,
                        startDate: true,
                        endDate: true
                    }
                }
            }
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Certificate not found or invalid code'
            });
        }

        // Return public certificate info
        res.json({
            success: true,
            valid: true,
            data: {
                recipientName: certificate.recipientName,
                category: certificate.category,
                achievement: certificate.achievement,
                rank: certificate.rank,
                totalScore: certificate.totalScore,
                issuedAt: certificate.issuedAt,
                competition: certificate.competition,
                validationCode: certificate.validationCode
            }
        });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

export default router;

