import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

export const getPublicLabs = async (req: Request, res: Response) => {
    try {
        const labs = await prisma.labFeature.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(labs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAdminLabs = async (req: Request, res: Response) => {
    try {
        const labs = await prisma.labFeature.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(labs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateLabStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isPublic, status, name, description, routePath } = req.body;

    try {
        const lab = await prisma.labFeature.update({
            where: { id },
            data: { isPublic, status, name, description, routePath }
        });
        res.json(lab);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createLabFeature = async (req: Request, res: Response) => {
    try {
        const lab = await prisma.labFeature.create({
            data: req.body
        });
        res.json(lab);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
