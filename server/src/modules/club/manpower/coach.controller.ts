import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

/**
 * Get current coach profile
 */
export const getMyCoachProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        let coach = await prisma.coach.findUnique({
            where: { userId },
            include: { user: { select: { name: true, email: true, avatarUrl: true } } }
        });

        // If no coach profile exists but user is COACH role, return empty/default or create one?
        // Let's return null if not found, frontend can prompt to "Complete Profile"
        if (!coach) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: coach });
    } catch (error) {
        console.error('Get coach profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coach profile' });
    }
};

/**
 * Upload/Update Certification
 */
export const updateCertification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { certificateUrl, certificateLevel, bio, yearsExperience } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Upsert coach profile
        const coach = await prisma.coach.upsert({
            where: { userId },
            update: {
                certificateUrl,
                certificateLevel,
                bio,
                yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
                verificationStatus: 'PENDING', // Reset to PENDING on update
                rejectionReason: null // Clear previous rejection
            },
            create: {
                userId,
                certificateUrl,
                certificateLevel,
                bio,
                yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
                verificationStatus: 'PENDING'
            }
        });

        res.json({ success: true, data: coach, message: 'Certification submitted for verification' });
    } catch (error) {
        console.error('Update certification error:', error);
        res.status(500).json({ success: false, message: 'Failed to update certification' });
    }
};

/**
 * Get Pending Verifications (For Perpani)
 */
export const getPendingCoaches = async (req: Request, res: Response) => {
    try {
        // Optional: Pagination
        const pendingCoaches = await prisma.coach.findMany({
            where: { verificationStatus: 'PENDING' },
            include: {
                user: { select: { name: true, email: true, coreId: true, club: { select: { name: true } } } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ success: true, data: pendingCoaches });
    } catch (error) {
        console.error('Get pending coaches error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending coaches' });
    }
};

/**
 * Verify Coach (For Perpani)
 */
export const verifyCoach = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Coach ID (not User ID)
        const { status, rejectionReason } = req.body; // status: VERIFIED or REJECTED
        const verifiedBy = req.user?.id;

        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const coach = await prisma.coach.update({
            where: { id },
            data: {
                verificationStatus: status,
                verifiedBy: status === 'VERIFIED' ? verifiedBy : null,
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null
            },
            include: { user: { select: { email: true, name: true } } }
        });

        // TODO: Send notification email?

        res.json({ success: true, data: coach, message: `Coach certification ${status.toLowerCase()}` });
    } catch (error) {
        console.error('Verify coach error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify coach' });
    }
};
