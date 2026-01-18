import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Verify SIP ID and return public user profile
 * Public endpoint (no auth required)
 */
export const verifySipId = async (req: Request, res: Response) => {
    try {
        const { sipId } = req.params;

        if (!sipId) {
            return res.status(400).json({
                success: false,
                message: 'SIP ID is required'
            });
        }

        // Find user by SIP ID
        const user = await prisma.user.findFirst({
            where: { sipId: sipId },
            select: {
                name: true,
                email: true,
                sipId: true,
                role: true,
                isActive: true,
                avatarUrl: true,
                phone: true,
                club: {
                    select: {
                        name: true
                    }
                },
                athlete: {
                    select: {
                        dateOfBirth: true,
                        gender: true,
                        division: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ID Not Found'
            });
        }

        // Format response to match verification page needs
        // In a real scenario, we might have multiple roles logic, but for now we map the single User role
        const roles = [
            {
                role: user.role,
                sipId: user.sipId,
                status: user.isActive ? 'ACTIVE' : 'INACTIVE', // Simplification
                verifiedBy: 'System', // Placeholder
                verifiedAt: new Date().toISOString() // Placeholder
            }
        ];

        const responseData = {
            sipId: user.sipId,
            name: user.name,
            photo: user.avatarUrl,
            email: user.email, // Consider masking this for public view? Usually on ID card it might be visible or hidden.
            phone: user.phone || '-', // Mask?
            gender: user.athlete?.gender === 'MALE' ? 'M' : user.athlete?.gender === 'FEMALE' ? 'F' : '-',
            birthDate: user.athlete?.dateOfBirth || '',
            address: '-', // Not in User model top level, maybe assume club address or hidden
            club: user.club?.name || '-',
            roles: roles,
            achievements: [] // Placeholder
        };

        return res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Verify SIP ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
