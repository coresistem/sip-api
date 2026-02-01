import { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

/**
 * GET /api/v1/role-modules/:role
 * Get all modules with config status for a specific role
 */
export const getRoleModules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = req.params;

        const config = await prisma.sidebarRoleConfig.findUnique({
            where: { role: role.toUpperCase() }
        });

        if (!config) {
            // Return empty list or default if no config exists
            res.json({
                success: true,
                data: []
            });
            return;
        }

        // Parse the JSON string from 'groups' column
        const modules = JSON.parse(config.groups);

        res.json({
            success: true,
            data: modules
        });
    } catch (error) {
        console.error('Get role modules error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch role modules' });
    }
};

/**
 * PUT /api/v1/role-modules/:role/:moduleId
 * Update single module config for a role
 */
export const updateRoleModuleConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, moduleId } = req.params;
        const { isEnabled, config } = req.body;

        const roleConfig = await prisma.sidebarRoleConfig.findUnique({
            where: { role: role.toUpperCase() }
        });

        if (!roleConfig) {
            res.status(404).json({ success: false, message: 'Role config not found' });
            return;
        }

        let modules = JSON.parse(roleConfig.groups);

        // Find and update the module
        // Note: The structure depends on how it's stored. Assuming flat list or nested in groups.
        // Based on client service, it expects a flat list of modules or recursive search.
        // For simplicity, let's assume 'modules' is an array of SystemModule objects.

        // Helper to recursively update module
        const updateModuleRecursive = (items: any[]): boolean => {
            for (let item of items) {
                if (item.id === moduleId) {
                    item.isEnabled = isEnabled;
                    if (config) item.config = config;
                    return true;
                }
                if (item.subModules && item.subModules.length > 0) {
                    if (updateModuleRecursive(item.subModules)) return true;
                }
            }
            return false;
        };

        const updated = updateModuleRecursive(modules);

        if (!updated) {
            res.status(404).json({ success: false, message: 'Module not found in config' });
            return;
        }

        // Save back to DB
        await prisma.sidebarRoleConfig.update({
            where: { role: role.toUpperCase() },
            data: { groups: JSON.stringify(modules) }
        });

        res.json({
            success: true,
            data: { id: moduleId, isEnabled, config }
        });
    } catch (error) {
        console.error('Update role module error:', error);
        res.status(500).json({ success: false, message: 'Failed to update module' });
    }
};

/**
 * POST /api/v1/role-modules/:role/batch
 * Batch update modules for a role
 */
export const batchUpdateRoleModules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = req.params;
        const { modules: updates } = req.body; // Array of { moduleId, isEnabled, config }

        const roleConfig = await prisma.sidebarRoleConfig.findUnique({
            where: { role: role.toUpperCase() }
        });

        if (!roleConfig) {
            res.status(404).json({ success: false, message: 'Role config not found' });
            return;
        }

        let modules = JSON.parse(roleConfig.groups);
        interface UpdateModule {
            moduleId: string;
            isEnabled: boolean;
            config?: any;
        }

        const updatesMap = new Map((updates as UpdateModule[]).map((u) => [u.moduleId, u]));

        const updateRecursive = (items: any[]) => {
            for (let item of items) {
                if (updatesMap.has(item.id)) {
                    const update = updatesMap.get(item.id);
                    // Ensure update is not undefined before accessing properties
                    if (update) {
                        item.isEnabled = update.isEnabled;
                        if (update.config) item.config = update.config;
                    }
                }
                if (item.subModules && item.subModules.length > 0) {
                    updateRecursive(item.subModules);
                }
            }
        };

        updateRecursive(modules);

        await prisma.sidebarRoleConfig.update({
            where: { role: role.toUpperCase() },
            data: { groups: JSON.stringify(modules) }
        });

        res.json({
            success: true,
            data: updates
        });
    } catch (error) {
        console.error('Batch update role modules error:', error);
        res.status(500).json({ success: false, message: 'Failed to batch update' });
    }
};

/**
 * GET /api/v1/role-modules/my-modules
 * Get enabled modules for current user's role
 */
export const getMyEnabledModules = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const role = user.activeRole || user.role;

        const config = await prisma.sidebarRoleConfig.findUnique({
            where: { role: role }
        });

        if (!config) {
            res.json({ success: true, data: [] });
            return;
        }

        const modules = JSON.parse(config.groups);

        // Filter only enabled modules (Optional: Logic to filter hierarchy)
        // Usually the frontend does the filtering based on 'isEnabled' flag, 
        // but we can do it here for security. returning all for now as per previous logic.

        res.json({
            success: true,
            data: modules
        });

    } catch (error) {
        console.error('Get my modules error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch my modules' });
    }
};
