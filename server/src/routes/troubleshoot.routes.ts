import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Validation schemas
const createTroubleshootSchema = z.object({
    body: z.object({
        tsId: z.string().min(1, 'TS ID is required'),
        title: z.string().min(1, 'Title is required'),
        category: z.enum(['Authentication', 'Database', 'UI', 'API', 'Build', 'Deployment']),
        severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
        effort: z.enum(['Quick', 'Medium', 'Long']),
        symptoms: z.string().min(1, 'Symptoms are required'),
        rootCause: z.string().min(1, 'Root cause is required'),
        debugSteps: z.string().min(1, 'Debug steps are required'),
        solution: z.string().min(1, 'Solution is required'),
        prevention: z.string().optional(),
        relatedFiles: z.string().optional(),
    }),
});

const updateTroubleshootSchema = z.object({
    body: z.object({
        tsId: z.string().optional(),
        title: z.string().optional(),
        category: z.enum(['Authentication', 'Database', 'UI', 'API', 'Build', 'Deployment']).optional(),
        severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
        effort: z.enum(['Quick', 'Medium', 'Long']).optional(),
        symptoms: z.string().optional(),
        rootCause: z.string().optional(),
        debugSteps: z.string().optional(),
        solution: z.string().optional(),
        prevention: z.string().optional(),
        relatedFiles: z.string().optional(),
    }),
});

// GET /api/v1/troubleshoot - List all entries with optional filters
router.get('/', authenticate, async (req, res) => {
    try {
        const { category, severity, search } = req.query;

        const where: any = {};

        if (category && typeof category === 'string') {
            where.category = category;
        }

        if (severity && typeof severity === 'string') {
            where.severity = severity;
        }

        if (search && typeof search === 'string') {
            where.OR = [
                { title: { contains: search } },
                { symptoms: { contains: search } },
                { rootCause: { contains: search } },
                { solution: { contains: search } },
            ];
        }

        const entries = await (prisma as any).troubleshoot.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: entries,
        });
    } catch (error) {
        console.error('Error fetching troubleshoot entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch troubleshoot entries',
        });
    }
});

// GET /api/v1/troubleshoot/:id - Get single entry
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await (prisma as any).troubleshoot.findUnique({
            where: { id },
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found',
            });
        }

        res.json({
            success: true,
            data: entry,
        });
    } catch (error) {
        console.error('Error fetching troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch troubleshoot entry',
        });
    }
});

// POST /api/v1/troubleshoot - Create new entry (Super Admin only)
router.post('/', authenticate, validate(createTroubleshootSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can create troubleshoot entries',
            });
        }

        const data = req.body;

        // Check if tsId already exists
        const existing = await (prisma as any).troubleshoot.findUnique({
            where: { tsId: data.tsId },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `TS ID ${data.tsId} already exists`,
            });
        }

        const entry = await (prisma as any).troubleshoot.create({
            data: {
                ...data,
                createdBy: req.user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: entry,
        });
    } catch (error) {
        console.error('Error creating troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create troubleshoot entry',
        });
    }
});

// PATCH /api/v1/troubleshoot/:id - Update entry
router.patch('/:id', authenticate, validate(updateTroubleshootSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can update troubleshoot entries',
            });
        }

        const { id } = req.params;
        const data = req.body;

        const entry = await (prisma as any).troubleshoot.update({
            where: { id },
            data,
        });

        res.json({
            success: true,
            message: 'Entry updated successfully',
            data: entry,
        });
    } catch (error) {
        console.error('Error updating troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update troubleshoot entry',
        });
    }
});

// DELETE /api/v1/troubleshoot/:id - Delete entry
router.delete('/:id', authenticate, async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete troubleshoot entries',
            });
        }

        const { id } = req.params;

        await (prisma as any).troubleshoot.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Entry deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete troubleshoot entry',
        });
    }
});

// GET /api/v1/troubleshoot/next-id - Get the next available TS ID
router.get('/next-id', authenticate, async (_req, res) => {
    try {
        const entries = await (prisma as any).troubleshoot.findMany({
            select: { tsId: true },
            orderBy: { tsId: 'desc' },
            take: 1,
        });

        let nextNumber = 1;
        if (entries.length > 0) {
            const lastId = entries[0].tsId; // e.g., "TS-007"
            const lastNumber = parseInt(lastId.replace('TS-', ''), 10);
            nextNumber = lastNumber + 1;
        }

        const nextId = `TS-${nextNumber.toString().padStart(3, '0')}`;

        res.json({
            success: true,
            data: { nextId },
        });
    } catch (error) {
        console.error('Error getting next TS ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get next TS ID',
        });
    }
});

export default router;
