import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation Schemas
const createManpowerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        role: z.enum(['MANAGER', 'MANPOWER', 'QC']).default('MANPOWER'),
        specialization: z.string().optional(),
        dailyCapacity: z.preprocess((val) => Number(val), z.number().min(1).default(10))
    })
});

const assignTaskSchema = z.object({
    body: z.object({
        manpowerId: z.string(),
        orderId: z.string(),
        stage: z.string(),
        quantity: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
        estimatedMinutes: z.preprocess((val) => Number(val), z.number().min(1).default(60))
    })
});

const updateTaskStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'])
    })
});

// Middleware: All routes require authentication
router.use(authenticate);

// =======================
// STAFF MANAGEMENT
// =======================

// GET /manpower - List all staff for the supplier
router.get('/', requireRole(['SUPPLIER', 'MANPOWER']), async (req, res) => {
    try {
        const user = (req as any).user;

        // Handle if requester is Manitower (find their supplier) or Supplier directly
        let supplierId = user.id;
        // If user role is MANPOWER, implementation might differ, but for now assuming Supplier manages this.

        const staff = await prisma.manpower.findMany({
            where: { supplierId },
            include: {
                tasks: {
                    where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
                }
            }
        });

        res.json({ success: true, data: staff });
    } catch (error) {
        console.error('Get manpower error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch manpower' });
    }
});

// POST /manpower - Create new staff
router.post('/', requireRole(['SUPPLIER']), validate(createManpowerSchema), async (req, res) => {
    try {
        const user = (req as any).user;
        const { name, role, specialization, dailyCapacity } = req.body;

        const staff = await prisma.manpower.create({
            data: {
                supplierId: user.id,
                name,
                role,
                specialization,
                dailyCapacity: parseInt(dailyCapacity) || 10
            }
        });

        res.status(201).json({ success: true, data: staff });
    } catch (error) {
        console.error('Create manpower error:', error);
        res.status(500).json({ success: false, message: 'Failed to create manpower' });
    }
});

// =======================
// TASK MANAGEMENT
// =======================

// GET /tasks - List tasks for Kanban board
router.get('/tasks', requireRole(['SUPPLIER', 'MANPOWER']), async (req, res) => {
    try {
        const user = (req as any).user;

        // Fetch tasks linked to supplier's orders or staff
        // For simplicity, fetching all tasks related to supplier's staff
        const tasks = await prisma.manpowerTask.findMany({
            where: {
                manpower: { supplierId: user.id }
            },
            include: {
                manpower: { select: { name: true } },
                order: { select: { id: true, status: true, items: true } }
            }
        });

        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
});

// POST /tasks/assign - Assign task to staff
router.post('/tasks/assign', requireRole(['SUPPLIER']), validate(assignTaskSchema), async (req, res) => {
    try {
        const { manpowerId, orderId, stage, quantity, estimatedMinutes } = req.body;

        const task = await prisma.manpowerTask.create({
            data: {
                manpowerId,
                orderId,
                stage,
                quantity: parseInt(quantity) || 1,
                estimatedMinutes: parseInt(estimatedMinutes) || 60,
                status: 'PENDING'
            }
        });

        // Update order status if it's the first task
        await prisma.jerseyOrder.update({
            where: { id: orderId },
            data: { status: 'PRODUCTION' }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({ success: false, message: 'Failed to assign task' });
    }
});

// POST /tasks/:taskId/status - Update task status
router.post('/tasks/:taskId/status', requireRole(['SUPPLIER', 'MANPOWER']), validate(updateTaskStatusSchema), async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body; // IN_PROGRESS, COMPLETED

        const updateData: any = { status };
        if (status === 'IN_PROGRESS') updateData.startedAt = new Date();
        if (status === 'COMPLETED') updateData.completedAt = new Date();

        const task = await prisma.manpowerTask.update({
            where: { id: taskId },
            data: updateData
        });

        res.json({ success: true, data: task });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update task status' });
    }
});

export default router;
