import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';
import { getEffectiveSupplierId } from '../../../services/supplier.service.js';

/**
 * List QC Inspections (optionally by orderId, with supplier isolation)
 * GET /api/v1/jersey/qc/inspections?orderId=xxx
 */
export async function listQCInspections(req: Request, res: Response) {
    try {
        const { orderId, status } = req.query;
        const user = (req as any).user;
        const supplierId = await getEffectiveSupplierId(user);

        const where: any = {};
        if (orderId) where.orderId = orderId;
        if (status) where.status = status;

        // Apply supplier isolation if not admin
        if (supplierId) {
            where.order = { supplierId };
        } else if (user.role !== 'SUPER_ADMIN') {
            return res.json({ success: true, data: [] });
        }

        const inspections = await prisma.qCInspection.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        orderNo: true,
                        status: true,
                        supplierId: true
                    }
                },
                rejections: {
                    include: {
                        repairRequest: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, data: inspections });
    } catch (error) {
        console.error('Failed to list QC inspections:', error);
        return res.status(500).json({ error: 'Failed to list QC inspections' });
    }
}

/**
 * Create new QC Inspection record
 * POST /api/v1/jersey/qc/inspections
 */
export async function createQCInspection(req: Request, res: Response) {
    try {
        const { orderId, totalQty, notes } = req.body;
        const user = (req as any).user;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Verify order exists and belongs to the user's supplier
        const order = await prisma.jerseyOrder.findUnique({
            where: { id: orderId },
            select: { id: true, supplierId: true, orderNo: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const supplierId = await getEffectiveSupplierId(user);
        if (user.role !== 'SUPER_ADMIN' && order.supplierId !== supplierId) {
            return res.status(403).json({ error: 'Access denied: Order does not belong to your supplier' });
        }

        const inspection = await prisma.qCInspection.create({
            data: {
                orderId,
                inspectorId: user.id,
                totalQty: totalQty || 1,
                status: 'PENDING',
                notes
            },
            include: {
                order: {
                    select: { id: true, orderNo: true }
                },
                rejections: true
            }
        });

        return res.status(201).json({ success: true, data: inspection });
    } catch (error) {
        console.error('Failed to create QC inspection:', error);
        return res.status(500).json({ error: 'Failed to create QC inspection' });
    }
}

/**
 * Update QC Inspection (mark items passed/rejected)
 * PUT /api/v1/jersey/qc/inspections/:id
 */
export async function updateQCInspection(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { passedQty, rejectedQty, status, result, notes } = req.body;

        const inspection = await prisma.qCInspection.update({
            where: { id },
            data: {
                passedQty,
                rejectedQty,
                status,
                result,
                notes,
                inspectedAt: status === 'COMPLETED' ? new Date() : undefined
            },
            include: {
                order: {
                    select: { id: true, orderNo: true }
                },
                rejections: {
                    include: { repairRequest: true }
                }
            }
        });

        return res.json({ data: inspection });
    } catch (error) {
        console.error('Failed to update QC inspection:', error);
        return res.status(500).json({ error: 'Failed to update QC inspection' });
    }
}

// ===========================================
// QC REJECTION MANAGEMENT
// ===========================================

/**
 * Create a QC Rejection (tag department)
 * POST /api/v1/jersey/qc/rejections
 */
export async function createQCRejection(req: Request, res: Response) {
    try {
        const {
            inspectionId,
            quantity,
            defectType,
            description,
            imageUrl,
            responsibleDept
        } = req.body;

        if (!inspectionId || !defectType || !description || !responsibleDept) {
            return res.status(400).json({
                error: 'inspectionId, defectType, description, and responsibleDept are required'
            });
        }

        // Validate department
        const validDepts = ['GRADING', 'PRINTING', 'CUTTING', 'PRESS', 'SEWING'];
        if (!validDepts.includes(responsibleDept)) {
            return res.status(400).json({
                error: `responsibleDept must be one of: ${validDepts.join(', ')}`
            });
        }

        const rejection = await prisma.qCRejection.create({
            data: {
                inspectionId,
                quantity: quantity || 1,
                defectType,
                description,
                imageUrl,
                responsibleDept,
                status: 'PENDING'
            },
            include: {
                inspection: {
                    select: {
                        id: true,
                        orderId: true,
                        order: {
                            select: { orderNo: true }
                        }
                    }
                }
            }
        });

        // Create notification for the tagged department workers
        // Find workers with this specialization and create notifications
        const workers = await prisma.manpower.findMany({
            where: { specialization: responsibleDept, isActive: true }
        });

        // In a full implementation, we'd notify these workers
        // For now, we'll just log it
        console.log(`QC Rejection created, notifying ${workers.length} ${responsibleDept} workers`);

        return res.status(201).json({ data: rejection });
    } catch (error) {
        console.error('Failed to create QC rejection:', error);
        return res.status(500).json({ error: 'Failed to create QC rejection' });
    }
}

/**
 * List QC Rejections (by inspection or department, with supplier isolation)
 * GET /api/v1/jersey/qc/rejections?inspectionId=xxx&dept=SEWING
 */
export async function listQCRejections(req: Request, res: Response) {
    try {
        const { inspectionId, dept, status } = req.query;
        const user = (req as any).user;
        const supplierId = await getEffectiveSupplierId(user);

        const where: any = {};
        if (inspectionId) where.inspectionId = inspectionId;
        if (dept) where.responsibleDept = dept;
        if (status) where.status = status;

        // Apply supplier isolation if not admin
        if (supplierId) {
            where.inspection = { order: { supplierId } };
        } else if (user.role !== 'SUPER_ADMIN') {
            return res.json({ success: true, data: [] });
        }

        const rejections = await prisma.qCRejection.findMany({
            where,
            include: {
                inspection: {
                    select: {
                        id: true,
                        orderId: true,
                        order: {
                            select: { id: true, orderNo: true, supplierId: true }
                        }
                    }
                },
                repairRequest: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, data: rejections });
    } catch (error) {
        console.error('Failed to list QC rejections:', error);
        return res.status(500).json({ error: 'Failed to list QC rejections' });
    }
}

// ===========================================
// REPAIR REQUEST MANAGEMENT
// ===========================================

/**
 * Create Repair Request (department asks supplier for approval)
 * POST /api/v1/jersey/qc/rejections/:id/repair-request
 */
export async function createRepairRequest(req: Request, res: Response) {
    try {
        const { id } = req.params; // rejection ID
        const { description, estimatedCost } = req.body;
        const user = (req as any).user;

        if (!description || estimatedCost === undefined) {
            return res.status(400).json({
                error: 'description and estimatedCost are required'
            });
        }

        // Check if rejection exists and doesn't already have a repair request
        const rejection = await prisma.qCRejection.findUnique({
            where: { id },
            include: {
                repairRequest: true,
                inspection: { include: { order: true } }
            }
        });

        if (!rejection) {
            return res.status(404).json({ error: 'Rejection not found' });
        }

        if (rejection.repairRequest) {
            return res.status(400).json({ error: 'Repair request already exists for this rejection' });
        }

        // Verify supplier isolation
        const effectiveSupplierId = await getEffectiveSupplierId(user);
        if (user.role !== 'SUPER_ADMIN' && rejection.inspection.order.supplierId !== effectiveSupplierId) {
            return res.status(403).json({ error: 'Access denied to this rejection' });
        }

        // Create repair request and update rejection status
        const [repairRequest] = await prisma.$transaction([
            prisma.repairRequest.create({
                data: {
                    rejectionId: id,
                    requestedById: user.id,
                    description,
                    estimatedCost,
                    status: 'PENDING'
                },
                include: {
                    rejection: {
                        include: {
                            inspection: {
                                select: {
                                    orderId: true,
                                    order: { select: { orderNo: true, supplierId: true } }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.qCRejection.update({
                where: { id },
                data: { status: 'REPAIR_REQUESTED' }
            })
        ]);

        return res.status(201).json({ success: true, data: repairRequest });
    } catch (error) {
        console.error('Failed to create repair request:', error);
        return res.status(500).json({ error: 'Failed to create repair request' });
    }
}

/**
 * List Repair Requests (for supplier)
 * GET /api/v1/jersey/repair-requests?status=PENDING
 */
export async function listRepairRequests(req: Request, res: Response) {
    try {
        const { status } = req.query;
        const user = (req as any).user;
        const effectiveSupplierId = await getEffectiveSupplierId(user);

        const where: any = {};
        if (status) where.status = status;

        // Apply supplier isolation
        if (effectiveSupplierId) {
            where.rejection = { inspection: { order: { supplierId: effectiveSupplierId } } };
        } else if (user.role !== 'SUPER_ADMIN') {
            return res.json({ success: true, data: [] });
        }

        const requests = await prisma.repairRequest.findMany({
            where,
            include: {
                rejection: {
                    include: {
                        inspection: {
                            include: {
                                order: {
                                    select: {
                                        id: true,
                                        orderNo: true,
                                        supplierId: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Failed to list repair requests:', error);
        return res.status(500).json({ error: 'Failed to list repair requests' });
    }
}

/**
 * Approve/Reject Repair Request (Supplier)
 * PUT /api/v1/jersey/repair-requests/:id
 */
export async function updateRepairRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { action, supplierNotes } = req.body; // action: 'APPROVE' or 'REJECT'
        const user = (req as any).user;

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
        }

        const repairRequest = await prisma.repairRequest.findUnique({
            where: { id },
            include: {
                rejection: { include: { inspection: { include: { order: true } } } }
            }
        });

        if (!repairRequest) {
            return res.status(404).json({ error: 'Repair request not found' });
        }

        // Verify supplier isolation
        const effectiveSupplierId = await getEffectiveSupplierId(user);
        if (user.role !== 'SUPER_ADMIN' && repairRequest.rejection.inspection.order.supplierId !== effectiveSupplierId) {
            return res.status(403).json({ error: 'Access denied: You are not authorized to decide on this repair' });
        }

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const rejectionStatus = action === 'APPROVE' ? 'REPAIR_APPROVED' : 'REPAIR_REJECTED';

        // Update repair request and rejection in transaction
        const [updated] = await prisma.$transaction([
            prisma.repairRequest.update({
                where: { id },
                data: {
                    status: newStatus,
                    decidedById: user.id,
                    decidedAt: new Date(),
                    supplierNotes
                },
                include: {
                    rejection: {
                        include: {
                            inspection: {
                                select: { orderId: true, order: { select: { orderNo: true } } }
                            }
                        }
                    }
                }
            }),
            prisma.qCRejection.update({
                where: { id: repairRequest.rejectionId },
                data: { status: rejectionStatus }
            })
        ]);

        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Failed to update repair request:', error);
        return res.status(500).json({ error: 'Failed to update repair request' });
    }
}

/**
 * Mark Repair as Complete
 * PUT /api/v1/jersey/repair-requests/:id/complete
 */
export async function completeRepair(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { actualCost } = req.body;
        const user = (req as any).user;

        const repairRequest = await prisma.repairRequest.findUnique({
            where: { id },
            include: {
                rejection: { include: { inspection: { include: { order: true } } } }
            }
        });

        if (!repairRequest) {
            return res.status(404).json({ error: 'Repair request not found' });
        }

        if (repairRequest.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Repair request must be approved first' });
        }

        // Verify supplier isolation
        const effectiveSupplierId = await getEffectiveSupplierId(user);
        if (user.role !== 'SUPER_ADMIN' && repairRequest.rejection.inspection.order.supplierId !== effectiveSupplierId) {
            return res.status(403).json({ error: 'Access denied to this repair' });
        }

        // Update repair request and rejection
        const [updated] = await prisma.$transaction([
            prisma.repairRequest.update({
                where: { id },
                data: {
                    actualCost: actualCost || repairRequest.estimatedCost,
                    repairedById: user.id,
                    repairedAt: new Date()
                }
            }),
            prisma.qCRejection.update({
                where: { id: repairRequest.rejectionId },
                data: { status: 'REPAIRED' }
            })
        ]);

        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Failed to complete repair:', error);
        return res.status(500).json({ error: 'Failed to complete repair' });
    }
}

// NOTE: Courier management functions (addCourierInfo, getCourierInfo, updateCourierInfo) 
// have been consolidated into server/src/routes/courier.routes.ts for cleaner separation of concerns.

export default {
    // QC Inspections
    listQCInspections,
    createQCInspection,
    updateQCInspection,
    // QC Rejections
    createQCRejection,
    listQCRejections,
    // Repair Requests
    createRepairRequest,
    listRepairRequests,
    updateRepairRequest,
    completeRepair
};
