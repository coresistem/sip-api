import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// SYSTEM PARTS (Warehouse)
// ============================================

// Get all system parts
export const getParts = async (req: Request, res: Response) => {
    try {
        const { type, category, status } = req.query;

        const where: any = {};
        if (type) where.type = type;
        if (category) where.category = category;
        if (status) where.status = status;
        else where.status = { not: 'DEPRECATED' };

        const parts = await prisma.systemPart.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { type: 'asc' },
                { name: 'asc' },
            ],
        });

        res.json({ success: true, data: parts });
    } catch (error) {
        console.error('Get parts error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch parts' });
    }
};

// Get single part by code
export const getPartByCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;

        const part = await prisma.systemPart.findUnique({
            where: { code },
        });

        if (!part) {
            return res.status(404).json({ success: false, error: 'Part not found' });
        }

        res.json({ success: true, data: part });
    } catch (error) {
        console.error('Get part error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch part' });
    }
};

// Create new part
export const createPart = async (req: Request, res: Response) => {
    try {
        const {
            code,
            name,
            description,
            type,
            category,
            icon,
            componentPath,
            propsSchema,
            dataSource,
            requiredPerms,
            dependencies,
        } = req.body;

        const part = await prisma.systemPart.create({
            data: {
                code,
                name,
                description,
                type,
                category,
                icon,
                componentPath,
                propsSchema,
                dataSource,
                requiredPerms,
                dependencies,
            },
        });

        res.status(201).json({ success: true, data: part });
    } catch (error: any) {
        console.error('Create part error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'Part code already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create part' });
    }
};

// Update part
export const updatePart = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const updateData = req.body;

        // Don't allow changing code
        delete updateData.code;

        const part = await prisma.systemPart.update({
            where: { code },
            data: updateData,
        });

        res.json({ success: true, data: part });
    } catch (error: any) {
        console.error('Update part error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Part not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to update part' });
    }
};

// Delete part (soft delete - mark as DEPRECATED)
export const deletePart = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;

        // Check if part is core
        const existing = await prisma.systemPart.findUnique({
            where: { code },
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Part not found' });
        }

        if (existing.isCore) {
            return res.status(400).json({ success: false, error: 'Cannot delete core system parts' });
        }

        const part = await prisma.systemPart.update({
            where: { code },
            data: { status: 'DEPRECATED' },
        });

        res.json({ success: true, data: part });
    } catch (error) {
        console.error('Delete part error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete part' });
    }
};

// ============================================
// FEATURE ASSEMBLIES
// ============================================

// Get all feature assemblies
export const getAssemblies = async (req: Request, res: Response) => {
    try {
        const { targetRole, status } = req.query;

        const where: any = {};
        if (targetRole) where.targetRole = targetRole;
        if (status) where.status = status;

        const assemblies = await prisma.featureAssembly.findMany({
            where,
            include: {
                parts: {
                    include: {
                        part: true,
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: [
                { targetRole: 'asc' },
                { name: 'asc' },
            ],
        });

        res.json({ success: true, data: assemblies });
    } catch (error) {
        console.error('Get assemblies error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch assemblies' });
    }
};

// Get single assembly by ID
export const getAssemblyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const assembly = await prisma.featureAssembly.findUnique({
            where: { id },
            include: {
                parts: {
                    include: {
                        part: true,
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!assembly) {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }

        res.json({ success: true, data: assembly });
    } catch (error) {
        console.error('Get assembly error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch assembly' });
    }
};

// Create new assembly
export const createAssembly = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const {
            code,
            name,
            description,
            targetRole,
            targetPage,
            route,
            parts = [],
        } = req.body;

        const assembly = await prisma.featureAssembly.create({
            data: {
                code,
                name,
                description,
                targetRole,
                targetPage,
                route,
                createdById: userId,
                parts: {
                    create: parts.map((p: any, index: number) => ({
                        partId: p.partId,
                        section: p.section || 'main',
                        sortOrder: p.sortOrder ?? index,
                        propsConfig: p.propsConfig ? JSON.stringify(p.propsConfig) : null,
                        dataBinding: p.dataBinding ? JSON.stringify(p.dataBinding) : null,
                        showCondition: p.showCondition ? JSON.stringify(p.showCondition) : null,
                    })),
                },
            },
            include: {
                parts: {
                    include: { part: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.status(201).json({ success: true, data: assembly });
    } catch (error: any) {
        console.error('Create assembly error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'Assembly code already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create assembly' });
    }
};

// Update assembly
export const updateAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, targetPage, route, status, testNotes, previewConfig } = req.body;

        const assembly = await prisma.featureAssembly.update({
            where: { id },
            data: {
                name,
                description,
                targetPage,
                route,
                status,
                testNotes,
                previewConfig,
            },
            include: {
                parts: {
                    include: { part: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.json({ success: true, data: assembly });
    } catch (error: any) {
        console.error('Update assembly error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to update assembly' });
    }
};

// Delete assembly
export const deleteAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.featureAssembly.delete({
            where: { id },
        });

        res.json({ success: true, message: 'Assembly deleted' });
    } catch (error: any) {
        console.error('Delete assembly error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to delete assembly' });
    }
};

// Add part to assembly
export const addPartToAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { partId, section, sortOrder, propsConfig, dataBinding, showCondition } = req.body;

        const featurePart = await prisma.featurePart.create({
            data: {
                featureId: id,
                partId,
                section: section || 'main',
                sortOrder: sortOrder ?? 0,
                propsConfig: propsConfig ? JSON.stringify(propsConfig) : null,
                dataBinding: dataBinding ? JSON.stringify(dataBinding) : null,
                showCondition: showCondition ? JSON.stringify(showCondition) : null,
            },
            include: { part: true },
        });

        res.status(201).json({ success: true, data: featurePart });
    } catch (error: any) {
        console.error('Add part to assembly error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'Part already exists in this section' });
        }
        res.status(500).json({ success: false, error: 'Failed to add part' });
    }
};

// Remove part from assembly
export const removePartFromAssembly = async (req: Request, res: Response) => {
    try {
        const { id, featurePartId } = req.params;

        await prisma.featurePart.delete({
            where: { id: featurePartId },
        });

        res.json({ success: true, message: 'Part removed from assembly' });
    } catch (error: any) {
        console.error('Remove part from assembly error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Feature part not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to remove part' });
    }
};

// Update part config in assembly
export const updateFeaturePart = async (req: Request, res: Response) => {
    try {
        const { featurePartId } = req.params;
        const { section, sortOrder, propsConfig, dataBinding, showCondition } = req.body;

        const featurePart = await prisma.featurePart.update({
            where: { id: featurePartId },
            data: {
                section,
                sortOrder,
                propsConfig: propsConfig !== undefined ? (propsConfig ? JSON.stringify(propsConfig) : null) : undefined,
                dataBinding: dataBinding !== undefined ? (dataBinding ? JSON.stringify(dataBinding) : null) : undefined,
                showCondition: showCondition !== undefined ? (showCondition ? JSON.stringify(showCondition) : null) : undefined,
            },
            include: { part: true },
        });

        res.json({ success: true, data: featurePart });
    } catch (error: any) {
        console.error('Update feature part error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Feature part not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to update feature part' });
    }
};

// Approve assembly (Super Admin only)
export const approveAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const assembly = await prisma.featureAssembly.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedById: userId,
                approvedAt: new Date(),
            },
        });

        res.json({ success: true, data: assembly });
    } catch (error: any) {
        console.error('Approve assembly error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }
        res.status(500).json({ success: false, error: 'Failed to approve assembly' });
    }
};

// Deploy assembly to production
export const deployAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await prisma.featureAssembly.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }

        if (existing.status !== 'APPROVED') {
            return res.status(400).json({ success: false, error: 'Assembly must be approved before deployment' });
        }

        const assembly = await prisma.featureAssembly.update({
            where: { id },
            data: {
                status: 'DEPLOYED',
                deployedAt: new Date(),
            },
            include: {
                parts: {
                    include: { part: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.json({ success: true, data: assembly });
    } catch (error) {
        console.error('Deploy assembly error:', error);
        res.status(500).json({ success: false, error: 'Failed to deploy assembly' });
    }
};

// Rollback deployed assembly back to APPROVED status
export const rollbackAssembly = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await prisma.featureAssembly.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }

        if (existing.status !== 'DEPLOYED') {
            return res.status(400).json({ success: false, error: 'Only deployed assemblies can be rolled back' });
        }

        const assembly = await prisma.featureAssembly.update({
            where: { id },
            data: {
                status: 'APPROVED',
                deployedAt: null,
            },
            include: {
                parts: {
                    include: { part: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.json({ success: true, data: assembly });
    } catch (error) {
        console.error('Rollback assembly error:', error);
        res.status(500).json({ success: false, error: 'Failed to rollback assembly' });
    }
};

// Revert assembly back to DRAFT status (for editing)
export const revertToDraft = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await prisma.featureAssembly.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Assembly not found' });
        }

        if (existing.status === 'DEPLOYED') {
            return res.status(400).json({ success: false, error: 'Cannot revert deployed assemblies. Rollback first.' });
        }

        const assembly = await prisma.featureAssembly.update({
            where: { id },
            data: {
                status: 'DRAFT',
                approvedById: null,
                approvedAt: null,
                // Increment version when reverting for re-editing
                version: existing.version + 1,
            },
            include: {
                parts: {
                    include: { part: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.json({ success: true, data: assembly });
    } catch (error) {
        console.error('Revert to draft error:', error);
        res.status(500).json({ success: false, error: 'Failed to revert assembly' });
    }
};
