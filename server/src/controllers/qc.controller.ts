import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// ===========================================
// QC INSPECTION MANAGEMENT
// ===========================================

/**
 * List QC Inspections (optionally by orderId)
 * GET /api/v1/jersey/qc/inspections?orderId=xxx
 */
export async function listQCInspections(req: Request, res: Response) {
    try {
        const { orderId, status } = req.query;

        const where: any = {};
        if (orderId) where.orderId = orderId;
        if (status) where.status = status;

        const inspections = await prisma.qCInspection.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        orderNo: true,
                        status: true,
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

        return res.json({ data: inspections });
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
        const userId = (req as any).user?.id;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Verify order exists and is in PRODUCTION status
        const order = await prisma.jerseyOrder.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const inspection = await prisma.qCInspection.create({
            data: {
                orderId,
                inspectorId: userId,
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

        return res.status(201).json({ data: inspection });
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
 * List QC Rejections (by inspection or department)
 * GET /api/v1/jersey/qc/rejections?inspectionId=xxx&dept=SEWING
 */
export async function listQCRejections(req: Request, res: Response) {
    try {
        const { inspectionId, dept, status } = req.query;

        const where: any = {};
        if (inspectionId) where.inspectionId = inspectionId;
        if (dept) where.responsibleDept = dept;
        if (status) where.status = status;

        const rejections = await prisma.qCRejection.findMany({
            where,
            include: {
                inspection: {
                    select: {
                        id: true,
                        orderId: true,
                        order: {
                            select: { id: true, orderNo: true }
                        }
                    }
                },
                repairRequest: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ data: rejections });
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
        const userId = (req as any).user?.id;

        if (!description || estimatedCost === undefined) {
            return res.status(400).json({
                error: 'description and estimatedCost are required'
            });
        }

        // Check if rejection exists and doesn't already have a repair request
        const rejection = await prisma.qCRejection.findUnique({
            where: { id },
            include: { repairRequest: true }
        });

        if (!rejection) {
            return res.status(404).json({ error: 'Rejection not found' });
        }

        if (rejection.repairRequest) {
            return res.status(400).json({ error: 'Repair request already exists for this rejection' });
        }

        // Create repair request and update rejection status
        const [repairRequest] = await prisma.$transaction([
            prisma.repairRequest.create({
                data: {
                    rejectionId: id,
                    requestedById: userId,
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

        return res.status(201).json({ data: repairRequest });
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
        const { status, supplierId } = req.query;

        const where: any = {};
        if (status) where.status = status;

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

        // Filter by supplier if needed (supplier should only see their orders)
        const filteredRequests = supplierId
            ? requests.filter(r => r.rejection.inspection.order.supplierId === supplierId)
            : requests;

        return res.json({ data: filteredRequests });
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
        const userId = (req as any).user?.id;

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
        }

        const repairRequest = await prisma.repairRequest.findUnique({
            where: { id },
            include: { rejection: true }
        });

        if (!repairRequest) {
            return res.status(404).json({ error: 'Repair request not found' });
        }

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const rejectionStatus = action === 'APPROVE' ? 'REPAIR_APPROVED' : 'REPAIR_REJECTED';

        // Update repair request and rejection in transaction
        const [updated] = await prisma.$transaction([
            prisma.repairRequest.update({
                where: { id },
                data: {
                    status: newStatus,
                    decidedById: userId,
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

        return res.json({ data: updated });
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
        const userId = (req as any).user?.id;

        const repairRequest = await prisma.repairRequest.findUnique({
            where: { id },
            include: { rejection: true }
        });

        if (!repairRequest) {
            return res.status(404).json({ error: 'Repair request not found' });
        }

        if (repairRequest.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Repair request must be approved first' });
        }

        // Update repair request and rejection
        const [updated] = await prisma.$transaction([
            prisma.repairRequest.update({
                where: { id },
                data: {
                    actualCost: actualCost || repairRequest.estimatedCost,
                    repairedById: userId,
                    repairedAt: new Date()
                }
            }),
            prisma.qCRejection.update({
                where: { id: repairRequest.rejectionId },
                data: { status: 'REPAIRED' }
            })
        ]);

        return res.json({ data: updated });
    } catch (error) {
        console.error('Failed to complete repair:', error);
        return res.status(500).json({ error: 'Failed to complete repair' });
    }
}

// ===========================================
// COURIER MANAGEMENT
// ===========================================

/**
 * Add Courier Info to Order
 * POST /api/v1/jersey/orders/:id/courier
 */
export async function addCourierInfo(req: Request, res: Response) {
    try {
        const { id } = req.params; // order ID
        const {
            courierName,
            awbNumber,
            trackingUrl,
            shippingCost,
            estimatedDelivery
        } = req.body;

        if (!courierName || !awbNumber) {
            return res.status(400).json({ error: 'courierName and awbNumber are required' });
        }

        // Check if order exists
        const order = await prisma.jerseyOrder.findUnique({
            where: { id }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Create or update courier info
        const courierInfo = await prisma.courierInfo.upsert({
            where: { orderId: id },
            create: {
                orderId: id,
                courierName,
                awbNumber,
                trackingUrl,
                shippingCost,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                shippedAt: new Date()
            },
            update: {
                courierName,
                awbNumber,
                trackingUrl,
                shippingCost,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                shippedAt: new Date()
            }
        });

        // Update order status to SHIPPED
        await prisma.jerseyOrder.update({
            where: { id },
            data: { status: 'SHIPPED' }
        });

        // Add tracking record
        const userId = (req as any).user?.id;
        await prisma.orderTracking.create({
            data: {
                orderId: id,
                status: 'SHIPPED',
                description: `Dikirim via ${courierName} - AWB: ${awbNumber}`,
                updatedBy: userId
            }
        });

        return res.status(201).json({ data: courierInfo });
    } catch (error) {
        console.error('Failed to add courier info:', error);
        return res.status(500).json({ error: 'Failed to add courier info' });
    }
}

/**
 * Get Courier Info for Order
 * GET /api/v1/jersey/orders/:id/courier
 */
export async function getCourierInfo(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const courierInfo = await prisma.courierInfo.findUnique({
            where: { orderId: id },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNo: true,
                        status: true,
                        customerId: true,
                        shippingAddress: true
                    }
                }
            }
        });

        if (!courierInfo) {
            return res.status(404).json({ error: 'Courier info not found' });
        }

        return res.json({ data: courierInfo });
    } catch (error) {
        console.error('Failed to get courier info:', error);
        return res.status(500).json({ error: 'Failed to get courier info' });
    }
}

/**
 * Update Courier Info (mark as delivered)
 * PUT /api/v1/jersey/orders/:id/courier
 */
export async function updateCourierInfo(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { deliveredAt, trackingUrl, notes } = req.body;

        const courierInfo = await prisma.courierInfo.findUnique({
            where: { orderId: id }
        });

        if (!courierInfo) {
            return res.status(404).json({ error: 'Courier info not found' });
        }

        const updated = await prisma.courierInfo.update({
            where: { orderId: id },
            data: {
                deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
                trackingUrl,
                notes
            }
        });

        // If delivered, update order status
        if (deliveredAt) {
            await prisma.jerseyOrder.update({
                where: { id },
                data: { status: 'DELIVERED' }
            });

            const userId = (req as any).user?.id;
            await prisma.orderTracking.create({
                data: {
                    orderId: id,
                    status: 'DELIVERED',
                    description: 'Pesanan telah diterima',
                    updatedBy: userId
                }
            });
        }

        return res.json({ data: updated });
    } catch (error) {
        console.error('Failed to update courier info:', error);
        return res.status(500).json({ error: 'Failed to update courier info' });
    }
}

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
    completeRepair,
    // Courier
    addCourierInfo,
    getCourierInfo,
    updateCourierInfo
};
