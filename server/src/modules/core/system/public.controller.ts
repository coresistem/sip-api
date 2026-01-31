import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

/**
 * Verify CORE ID and return public user profile
 * Public endpoint (no auth required)
 */
export const verifyCoreId = async (req: Request, res: Response) => {
    try {
        const { coreId } = req.params;

        if (!coreId) {
            return res.status(400).json({
                success: false,
                message: 'CORE ID is required'
            });
        }

        // Find user by CORE ID
        const user = await prisma.user.findFirst({
            where: { coreId: coreId },
            select: {
                name: true,
                email: true,
                coreId: true,
                role: true,
                isActive: true,
                avatarUrl: true,
                phone: true,
                gender: true,
                dateOfBirth: true,
                club: {
                    select: {
                        name: true
                    }
                },
                athlete: {
                    select: {
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
                coreId: user.coreId,
                status: user.isActive ? 'ACTIVE' : 'INACTIVE', // Simplification
                verifiedBy: 'System', // Placeholder
                verifiedAt: new Date().toISOString() // Placeholder
            }
        ];

        const responseData = {
            coreId: user.coreId,
            name: user.name,
            photo: user.avatarUrl,
            email: user.email, // Consider masking this for public view? Usually on ID card it might be visible or hidden.
            phone: user.phone || '-', // Mask?
            gender: user.gender === 'MALE' ? 'M' : user.gender === 'FEMALE' ? 'F' : '-',
            birthDate: user.dateOfBirth || '',
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
        console.error('Verify CORE ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
