import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// Use Express Request type which is extended globally in auth.middleware.ts
type AuthRequest = Request;

// Get all modules with role config status for a specific role
export const getRoleModules = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.params;

        // Get all modules (optionally filter by category for ATHLETE)
        const modules = await prisma.module.findMany({
            include: {
                subModules: {
                    include: {
                        options: true
                    }
                },
                roleConfigs: {
                    where: { role }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Transform to include isEnabled status
        const result = modules.map(mod => ({
            ...mod,
            isEnabled: mod.roleConfigs.length > 0
                ? mod.roleConfigs[0].isEnabled
                : true, // Default to enabled if no config exists
            config: mod.roleConfigs.length > 0
                ? JSON.parse(mod.roleConfigs[0].config || '{}')
                : {}
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching role modules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch role modules'
        });
    }
};

// Update role module config (toggle enabled/disabled)
export const updateRoleModuleConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { role, moduleId } = req.params;
        const { isEnabled, config } = req.body;

        // Upsert the role module config
        const roleConfig = await prisma.roleModuleConfig.upsert({
            where: {
                role_moduleId: {
                    role,
                    moduleId
                }
            },
            update: {
                isEnabled: isEnabled ?? true,
                config: config ? JSON.stringify(config) : '{}'
            },
            create: {
                role,
                moduleId,
                isEnabled: isEnabled ?? true,
                config: config ? JSON.stringify(config) : '{}'
            },
            include: {
                module: true
            }
        });

        res.json({
            success: true,
            data: roleConfig,
            message: `Module ${roleConfig.isEnabled ? 'enabled' : 'disabled'} for ${role} role`
        });
    } catch (error) {
        console.error('Error updating role module config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update role module config'
        });
    }
};

// Get enabled modules for current user's role (for sidebar)
export const getEnabledModulesForRole = async (req: AuthRequest, res: Response) => {
    try {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                error: 'User role not found'
            });
        }

        // Get all modules with their role configs
        const modules = await prisma.module.findMany({
            include: {
                subModules: true,
                roleConfigs: {
                    where: { role: userRole }
                }
            }
        });

        // Filter to only enabled modules
        const enabledModules = modules.filter(mod => {
            // If no config exists, default to enabled
            if (mod.roleConfigs.length === 0) return true;
            return mod.roleConfigs[0].isEnabled;
        });

        res.json({
            success: true,
            data: enabledModules.map(mod => ({
                id: mod.id,
                code: mod.code,
                name: mod.name,
                category: mod.category,
                subModules: mod.subModules,
                config: mod.roleConfigs[0]?.config ? JSON.parse(mod.roleConfigs[0].config) : {}
            }))
        });
    } catch (error) {
        console.error('Error fetching enabled modules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enabled modules'
        });
    }
};

// Batch update - enable/disable multiple modules for a role
export const batchUpdateRoleModules = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.params;
        const { modules } = req.body; // Array of { moduleId, isEnabled, config? }

        if (!Array.isArray(modules)) {
            return res.status(400).json({
                success: false,
                error: 'Modules must be an array'
            });
        }

        const results = await Promise.all(
            modules.map(({ moduleId, isEnabled, config }) =>
                prisma.roleModuleConfig.upsert({
                    where: {
                        role_moduleId: { role, moduleId }
                    },
                    update: {
                        isEnabled: isEnabled ?? true,
                        config: config ? JSON.stringify(config) : '{}'
                    },
                    create: {
                        role,
                        moduleId,
                        isEnabled: isEnabled ?? true,
                        config: config ? JSON.stringify(config) : '{}'
                    }
                })
            )
        );

        res.json({
            success: true,
            data: results,
            message: `Updated ${results.length} module configs for ${role} role`
        });
    } catch (error) {
        console.error('Error batch updating role modules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch update role modules'
        });
    }
};
