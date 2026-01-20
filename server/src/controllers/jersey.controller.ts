import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// ===========================================
// PRODUCT CRUD (Supplier only)
// ===========================================

// GET /api/v1/jersey/products - List products
export const listProducts = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const userClubId = (req as any).user?.clubId;
        const { supplierId, active } = req.query;

        const where: Record<string, unknown> = {};

        // Suppliers only see their own products
        if (userRole === 'SUPPLIER') {
            where.supplierId = userId;
        } else {
            // Non-suppliers see active products based on visibility
            where.isActive = true;

            // For customers, apply visibility filtering
            if (userRole !== 'SUPER_ADMIN') {
                where.OR = [
                    { visibility: 'PUBLIC' },
                    { visibility: 'CLUBS_ONLY', AND: { NOT: { supplierId: null } } },
                    // SPECIFIC visibility - check if user's club is in allowedClubIds
                    ...(userClubId ? [{ visibility: 'SPECIFIC', allowedClubIds: { contains: userClubId } }] : [])
                ];
            }

            if (supplierId) {
                where.supplierId = supplierId;
            }
        }

        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        const products = await prisma.jerseyProduct.findMany({
            where,
            include: {
                variants: {
                    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }]
                },
                _count: { select: { orderItems: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get supplier names
        const supplierIds = [...new Set(products.map(p => p.supplierId))];
        const suppliers = await prisma.user.findMany({
            where: { id: { in: supplierIds } },
            select: { id: true, name: true }
        });
        const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));

        res.json({
            success: true,
            data: products.map(p => ({
                ...p,
                supplierName: supplierMap[p.supplierId] || 'Unknown Supplier',
                ordersCount: p._count.orderItems
            }))
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ success: false, message: 'Failed to list products' });
    }
};

// GET /api/v1/jersey/products/:id - Get product with variants
export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await prisma.jerseyProduct.findUnique({
            where: { id },
            include: {
                variants: {
                    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }]
                }
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Group variants by category
        const variantsByCategory: Record<string, typeof product.variants> = {};
        product.variants.forEach(v => {
            if (!variantsByCategory[v.category]) {
                variantsByCategory[v.category] = [];
            }
            variantsByCategory[v.category].push(v);
        });

        res.json({
            success: true,
            data: {
                ...product,
                variantsByCategory
            }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to get product' });
    }
};

// POST /api/v1/jersey/products - Create new product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, sku, category, description, designUrl, designThumbnail, basePrice, minOrderQty, variants } = req.body;

        if (!name || !basePrice || !sku || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, SKU, Category, and Base Price are required'
            });
        }

        // Check for existing SKU for this supplier
        const existingProduct = await prisma.jerseyProduct.findFirst({
            where: {
                supplierId: userId,
                sku: sku
            }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: `SKU '${sku}' already exists for your account`
            });
        }

        const product = await prisma.jerseyProduct.create({
            data: {
                supplierId: userId!,
                name,
                sku,
                category,
                description,
                designUrl,
                designThumbnail,
                basePrice: parseFloat(basePrice),
                minOrderQty: minOrderQty || 1,
                variants: variants ? {
                    create: variants.map((v: { category: string; name: string; priceModifier: number; isDefault?: boolean }, idx: number) => ({
                        category: v.category,
                        name: v.name,
                        priceModifier: v.priceModifier,
                        isDefault: v.isDefault || false,
                        sortOrder: idx
                    }))
                } : undefined
            },
            include: { variants: true }
        });

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

// PUT /api/v1/jersey/products/:id - Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, sku, category, description, designUrl, designThumbnail, basePrice, minOrderQty, isActive } = req.body;

        const product = await prisma.jerseyProduct.update({
            where: { id },
            data: {
                name,
                sku,
                category,
                description,
                designUrl,
                designThumbnail,
                basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
                minOrderQty,
                isActive
            },
            include: { variants: true }
        });

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

// DELETE /api/v1/jersey/products/:id - Deactivate product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.jerseyProduct.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'Product deactivated successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

// ===========================================
// VARIANT MANAGEMENT
// ===========================================

// POST /api/v1/jersey/products/:id/variants - Add variant
export const addVariant = async (req: Request, res: Response) => {
    try {
        const { id: productId } = req.params;
        const { category, name, priceModifier, isDefault } = req.body;

        if (!category || !name || priceModifier === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Category, name, and priceModifier are required'
            });
        }

        // Get max sort order
        const maxOrder = await prisma.productVariant.findFirst({
            where: { productId, category },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });

        const variant = await prisma.productVariant.create({
            data: {
                productId,
                category,
                name,
                priceModifier: parseFloat(priceModifier),
                isDefault: isDefault || false,
                sortOrder: (maxOrder?.sortOrder ?? -1) + 1
            }
        });

        res.status(201).json({
            success: true,
            data: variant,
            message: 'Variant added successfully'
        });
    } catch (error) {
        console.error('Add variant error:', error);
        res.status(500).json({ success: false, message: 'Failed to add variant' });
    }
};

// PUT /api/v1/jersey/variants/:id - Update variant
export const updateVariant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, priceModifier, isDefault, sortOrder } = req.body;

        const variant = await prisma.productVariant.update({
            where: { id },
            data: {
                name,
                priceModifier: priceModifier !== undefined ? parseFloat(priceModifier) : undefined,
                isDefault,
                sortOrder
            }
        });

        res.json({
            success: true,
            data: variant,
            message: 'Variant updated successfully'
        });
    } catch (error) {
        console.error('Update variant error:', error);
        res.status(500).json({ success: false, message: 'Failed to update variant' });
    }
};

// DELETE /api/v1/jersey/variants/:id - Delete variant
export const deleteVariant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.productVariant.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Variant deleted successfully'
        });
    } catch (error) {
        console.error('Delete variant error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete variant' });
    }
};

// ===========================================
// WORKER MANAGEMENT (Supplier Staff)
// ===========================================

// GET /api/v1/jersey/workers - List workers
export const listWorkers = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { active, role, specialization } = req.query;

        const where: Record<string, unknown> = {
            supplierId: userId
        };

        if (active !== undefined) {
            where.isActive = active === 'true';
        }
        if (role) {
            where.role = role;
        }
        if (specialization) {
            where.specialization = specialization;
        }

        const workers = await prisma.jerseyWorker.findMany({
            where: where as any,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: workers });
    } catch (error) {
        console.error('Error listing workers:', error);
        res.status(500).json({ success: false, message: 'Failed to list workers' });
    }
};

// GET /api/v1/jersey/workers/:id - Get worker
export const getWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const worker = await prisma.jerseyWorker.findFirst({
            where: { id, supplierId: userId }
        });

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        res.json({ success: true, data: worker });
    } catch (error) {
        console.error('Error getting worker:', error);
        res.status(500).json({ success: false, message: 'Failed to get worker' });
    }
};

// POST /api/v1/jersey/workers - Create worker
export const createWorker = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, phone, email, role, specialization, dailyCapacity } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // 1. Create User account if email provided
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!existingUser) {
                // Auto-create user for worker
                const passwordHash = await bcrypt.hash('Worker123!', 12);
                await prisma.user.create({
                    data: {
                        email: email.toLowerCase(),
                        passwordHash,
                        name,
                        phone,
                        role: 'WORKER', // Enable login as Worker
                    }
                });
                console.log(`Auto-created User account for worker: ${email}`);
            }
        }

        const worker = await prisma.jerseyWorker.create({
            data: {
                supplierId: userId!,
                name,
                phone,
                email,
                role: role || 'WORKER',
                specialization,
                dailyCapacity: dailyCapacity || 10
            }
        });

        res.status(201).json({
            success: true,
            data: worker,
            message: email ? 'Worker created with login access (Password: Worker123!)' : 'Worker created (No login access)'
        });
    } catch (error) {
        console.error('Error creating worker:', error);
        res.status(500).json({ success: false, message: 'Failed to create worker' });
    }
};

// PUT /api/v1/jersey/workers/:id - Update worker
export const updateWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { name, phone, email, role, specialization, dailyCapacity, isActive } = req.body;

        const existing = await prisma.jerseyWorker.findFirst({
            where: { id, supplierId: userId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        const worker = await prisma.jerseyWorker.update({
            where: { id },
            data: { name, phone, email, role, specialization, dailyCapacity, isActive }
        });

        res.json({ success: true, data: worker });
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ success: false, message: 'Failed to update worker' });
    }
};

// DELETE /api/v1/jersey/workers/:id - Delete worker
export const deleteWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const existing = await prisma.jerseyWorker.findFirst({
            where: { id, supplierId: userId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        await prisma.jerseyWorker.delete({ where: { id } });

        res.json({ success: true, message: 'Worker deleted' });
    } catch (error) {
        console.error('Error deleting worker:', error);
        res.status(500).json({ success: false, message: 'Failed to delete worker' });
    }
};

// ===========================================
// TASK MANAGEMENT (Worker Tasks)
// ===========================================

// GET /api/v1/jersey/tasks - List tasks (for supplier or worker)
export const listTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { workerId, orderId, status, stage } = req.query;

        const where: Record<string, unknown> = {};

        // Multi-tenant isolation:
        // - SUPPLIER sees all tasks for their workers
        // - WORKER sees only their own tasks
        if (userRole === 'SUPPLIER') {
            // Get all workers belonging to this supplier
            where.worker = { supplierId: userId };
        } else if (userRole !== 'SUPER_ADMIN') {
            // Workers or other roles - only see tasks assigned to them
            // First find if they are a worker
            const worker = await prisma.jerseyWorker.findFirst({
                where: { email: req.user?.email }
            });
            if (worker) {
                where.workerId = worker.id;
            } else {
                // Not a worker, return empty
                return res.json({ success: true, data: [] });
            }
        }

        // Additional filters
        if (workerId) where.workerId = workerId;
        if (orderId) where.orderId = orderId;
        if (status) where.status = status;
        if (stage) where.stage = stage;

        const tasks = await prisma.workerTask.findMany({
            where,
            include: {
                worker: {
                    select: { id: true, name: true, specialization: true, supplierId: true }
                },
                order: {
                    select: { id: true, orderNo: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Error listing tasks:', error);
        res.status(500).json({ success: false, message: 'Failed to list tasks' });
    }
};

// POST /api/v1/jersey/tasks - Create task
export const createTask = async (req: Request, res: Response) => {
    try {
        const { workerId, orderId, stage, quantity, estimatedMinutes, notes } = req.body;

        if (!workerId || !orderId || !stage) {
            return res.status(400).json({ success: false, message: 'workerId, orderId, and stage are required' });
        }

        const task = await prisma.workerTask.create({
            data: {
                workerId,
                orderId,
                stage,
                quantity: quantity || 1,
                estimatedMinutes,
                notes
            },
            include: {
                worker: { select: { id: true, name: true } },
                order: { select: { id: true, orderNo: true } }
            }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Failed to create task' });
    }
};

// PUT /api/v1/jersey/tasks/:id - Update task (start, complete, etc.)
export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, notes, actualMinutes } = req.body;

        const updateData: Record<string, unknown> = {};

        if (status) {
            updateData.status = status;
            if (status === 'IN_PROGRESS' && !updateData.startedAt) {
                updateData.startedAt = new Date();
            }
            if (status === 'COMPLETED') {
                updateData.completedAt = new Date();
            }
        }
        if (notes !== undefined) updateData.notes = notes;
        if (actualMinutes !== undefined) updateData.actualMinutes = actualMinutes;

        const task = await prisma.workerTask.update({
            where: { id },
            data: updateData,
            include: {
                worker: { select: { id: true, name: true } },
                order: { select: { id: true, orderNo: true } }
            }
        });

        res.json({ success: true, data: task });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Failed to update task' });
    }
};

// DELETE /api/v1/jersey/tasks/:id - Delete task
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.workerTask.delete({ where: { id } });

        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task' });
    }
};
