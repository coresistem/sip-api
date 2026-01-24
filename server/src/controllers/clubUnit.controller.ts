import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Get all units for a club
 */
export const getClubUnits = async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const userClubId = req.user?.clubId;

        // Security check: Only allow access if user is Super Admin or belongs to the club
        if (req.user?.role !== 'SUPER_ADMIN' && userClubId !== clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to club units' });
        }

        const units = await prisma.clubUnit.findMany({
            where: { clubId },
            include: {
                _count: {
                    select: { athletes: true, schedules: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: units });
    } catch (error) {
        console.error('Get club units error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch club units' });
    }
};

/**
 * Create a new club unit
 */
export const createClubUnit = async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const { name, type, address, schoolId } = req.body;
        const userClubId = req.user?.clubId;

        if (req.user?.role !== 'SUPER_ADMIN' && userClubId !== clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (!name || !type) {
            return res.status(400).json({ success: false, message: 'Name and type are required' });
        }

        // Auto-generate a unique QR code string for this unit
        // This will be used by the frontend to generate the actual QR image
        const qrCode = `UNIT-${clubId.slice(-4)}-${Date.now().toString().slice(-6)}`;

        const unit = await prisma.clubUnit.create({
            data: {
                clubId,
                name,
                type,
                address,
                schoolId,
                qrCode
            }
        });

        res.status(201).json({ success: true, data: unit, message: 'Unit created successfully' });
    } catch (error) {
        console.error('Create club unit error:', error);
        res.status(500).json({ success: false, message: 'Failed to create unit' });
    }
};

/**
 * Update a club unit
 */
export const updateClubUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, type, address, schoolId } = req.body;
        const userClubId = req.user?.clubId;

        const existingUnit = await prisma.clubUnit.findUnique({
            where: { id }
        });

        if (!existingUnit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN' && userClubId !== existingUnit.clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const unit = await prisma.clubUnit.update({
            where: { id },
            data: {
                name,
                type,
                address,
                schoolId
            }
        });

        res.json({ success: true, data: unit, message: 'Unit updated successfully' });
    } catch (error) {
        console.error('Update club unit error:', error);
        res.status(500).json({ success: false, message: 'Failed to update unit' });
    }
};

/**
 * Delete a club unit
 */
export const deleteClubUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userClubId = req.user?.clubId;

        const existingUnit = await prisma.clubUnit.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { athletes: true }
                }
            }
        });

        if (!existingUnit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN' && userClubId !== existingUnit.clubId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Prevent deletion if unit has athletes linked
        if (existingUnit._count.athletes > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete unit with ${existingUnit._count.athletes} assigned athletes. Reassign them first.`
            });
        }

        await prisma.clubUnit.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Unit deleted successfully' });
    } catch (error) {
        console.error('Delete club unit error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete unit' });
    }
};
