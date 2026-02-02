import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

export const getLayoutConfig = async (req: Request, res: Response) => {
    try {
        const { featureKey } = req.params;
        const config = await (prisma as any).uILayoutConfig.findUnique({
            where: { featureKey }
        });

        if (!config) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: JSON.parse(config.config) });
    } catch (error) {
        console.error('Get Layout Config Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch layout config' });
    }
};

export const updateLayoutConfig = async (req: Request, res: Response) => {
    try {
        const { featureKey } = req.params;
        const { config } = req.body; // Expecting { order: string[], hidden: string[] }

        const updated = await (prisma as any).uILayoutConfig.upsert({
            where: { featureKey },
            update: { config: JSON.stringify(config) },
            create: { featureKey, config: JSON.stringify(config) }
        });

        res.json({ success: true, data: JSON.parse(updated.config) });
    } catch (error) {
        console.error('Update Layout Config Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update layout config' });
    }
};

export const getAllConfigs = async (req: Request, res: Response) => {
    try {
        const configs = await (prisma as any).uILayoutConfig.findMany();
        const formatted = configs.map((c: any) => ({
            featureKey: c.featureKey,
            ...JSON.parse(c.config)
        }));
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Get All Configs Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch layout configs' });
    }
};
