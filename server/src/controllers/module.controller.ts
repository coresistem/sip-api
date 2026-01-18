
import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Get all available system modules (The Lego Warehouse)
 */
export const getModules = async (req: Request, res: Response) => {
    try {
        const modules = await prisma.module.findMany({
            include: {
                subModules: {
                    include: {
                        options: true
                    },
                    orderBy: {
                        code: 'asc'
                    }
                }
            },
            orderBy: {
                category: 'asc' // FOUNDATION, COMMERCE, etc.
            }
        });

        res.json({
            success: true,
            data: modules
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch modules' });
    }
};

/**
 * Get configuration for the authenticated Organization
 */
export const getOrgConfig = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const configs = await prisma.organizationModuleAccess.findMany({
            where: {
                organizationId: userId
            },
            include: {
                module: {
                    select: {
                        code: true,
                        name: true
                    }
                }
            }
        });

        // Parse the JSON string config back to object
        const parsedConfigs = configs.map(c => ({
            ...c,
            config: JSON.parse(c.config)
        }));

        res.json({
            success: true,
            data: parsedConfigs
        });
    } catch (error) {
        console.error('Error fetching org config:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch config' });
    }
};

/**
 * Update configuration for a specific module
 * Body: { moduleId: string, isEnabled: boolean, config: Record<string, any> }
 */
export const updateOrgConfig = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { moduleId, isEnabled, config } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!moduleId) {
            return res.status(400).json({ success: false, message: 'Module ID is required' });
        }

        const updatedConfig = await prisma.organizationModuleAccess.upsert({
            where: {
                organizationId_moduleId: {
                    organizationId: userId,
                    moduleId: moduleId
                }
            },
            update: {
                isEnabled,
                config: JSON.stringify(config || {})
            },
            create: {
                organizationId: userId,
                moduleId,
                isEnabled: isEnabled ?? true,
                config: JSON.stringify(config || {})
            }
        });

        res.json({
            success: true,
            data: {
                ...updatedConfig,
                config: JSON.parse(updatedConfig.config)
            }
        });

    } catch (error) {
        console.error('Error updating org config:', error);
        res.status(500).json({ success: false, message: 'Failed to update config' });
    }
};
