import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';
import { AuthRequest } from '../../../middleware/auth.middleware.js';
import { auditService } from '../system/audit.service.js';
import { notificationService } from '../notification/notification.service.js';

/**
 * Controller for handling cross-entity role integration handshake.
 */

/**
 * Propose an integration request (Athlete/Coach to a Club/School/Perpani)
 */
export const proposeIntegration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { targetEntityId, targetEntityType, requestedRole, dataAccessScope, notes } = req.body;

        if (!targetEntityId || !targetEntityType || !requestedRole) {
            res.status(400).json({ status: 'error', message: 'Missing required integration fields' });
            return;
        }

        // Check for existing pending request
        const existing = await prisma.entityIntegrationRequest.findFirst({
            where: {
                userId,
                targetEntityId,
                targetEntityType,
                status: 'PENDING'
            }
        });

        if (existing) {
            res.status(400).json({ status: 'error', message: 'A pending request already exists for this entity' });
            return;
        }

        const request = await prisma.entityIntegrationRequest.create({
            data: {
                userId: userId!,
                targetEntityId,
                targetEntityType,
                requestedRole,
                dataAccessScope: dataAccessScope ? JSON.stringify(dataAccessScope) : null,
                notes,
                status: 'PENDING'
            }
        });

        // Log the action
        await auditService.logIntegration(userId!, request.id, 'ROLE_JOIN_REQUEST', {
            targetEntityType,
            targetEntityId,
            requestedRole
        });

        // Notification Logic
        let targetOwnerId: string | null = null;
        let entityName = targetEntityType;

        if (targetEntityType === 'CLUB') {
            const club = await prisma.club.findUnique({ where: { id: targetEntityId }, select: { ownerId: true, name: true } });
            if (club) {
                targetOwnerId = club.ownerId;
                entityName = club.name;
            }
        } else if (targetEntityType === 'SCHOOL') {
            const school = await prisma.school.findUnique({ where: { id: targetEntityId }, select: { ownerId: true, name: true } });
            if (school) {
                targetOwnerId = school.ownerId;
                entityName = school.name;
            }
        }

        if (targetOwnerId) {
            await notificationService.notifyIntegrationRequest(
                targetOwnerId,
                req.user?.name || 'A user',
                entityName,
                request.id
            );
        }

        res.status(201).json({
            status: 'success',
            data: request
        });
    } catch (error) {
        console.error('[IntegrationController] proposeIntegration error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

/**
 * Approve or Reject an integration request
 */
export const handleIntegrationDecision = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const actorId = req.user?.id;
        const { requestId, decision, feedback } = req.body; // decision: APPROVED | REJECTED

        if (!requestId || !['APPROVED', 'REJECTED'].includes(decision)) {
            res.status(400).json({ status: 'error', message: 'Invalid decision or missing request ID' });
            return;
        }

        const integrationRequest = await prisma.entityIntegrationRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!integrationRequest) {
            res.status(404).json({ status: 'error', message: 'Integration request not found' });
            return;
        }

        const updatedRequest = await prisma.entityIntegrationRequest.update({
            where: { id: requestId },
            data: {
                status: decision,
                notes: feedback ? `${integrationRequest.notes || ''}\n\nDecision Feedback: ${feedback}` : integrationRequest.notes
            }
        });

        // Perform actual integration logic if approved
        if (decision === 'APPROVED') {
            const { targetEntityType, targetEntityId, requestedRole, userId } = integrationRequest;

            if (targetEntityType === 'CLUB') {
                // Update primary club for the user
                await prisma.user.update({
                    where: { id: userId },
                    data: { clubId: targetEntityId }
                });

                // Sync with Athlete model if it exists
                if (requestedRole === 'ATHLETE') {
                    const athlete = await prisma.athlete.findUnique({ where: { userId } });
                    if (athlete) {
                        await prisma.athlete.update({
                            where: { userId },
                            data: { clubId: targetEntityId }
                        });
                    }
                }
            } else if (targetEntityType === 'SCHOOL') {
                // For schools, we use StudentEnrollment for many-to-many
                await prisma.studentEnrollment.upsert({
                    where: {
                        userId_schoolId: {
                            userId,
                            schoolId: targetEntityId
                        }
                    },
                    create: {
                        userId,
                        schoolId: targetEntityId
                    },
                    update: {}
                });
            }
        }

        // Log the audit trial
        await auditService.logIntegration(actorId!, requestId, decision === 'APPROVED' ? 'ROLE_JOIN_APPROVED' : 'ROLE_JOIN_REJECTED', {
            targetEntityType: integrationRequest.targetEntityType,
            targetEntityId: integrationRequest.targetEntityId,
            userId: integrationRequest.userId,
            feedback
        });

        // Notify the requester of the decision
        let entityName = integrationRequest.targetEntityType;
        if (integrationRequest.targetEntityType === 'CLUB') {
            const club = await prisma.club.findUnique({ where: { id: integrationRequest.targetEntityId }, select: { name: true } });
            if (club) entityName = club.name;
        } else if (integrationRequest.targetEntityType === 'SCHOOL') {
            const school = await prisma.school.findUnique({ where: { id: integrationRequest.targetEntityId }, select: { name: true } });
            if (school) entityName = school.name;
        }

        await notificationService.notifyIntegrationDecision(
            integrationRequest.userId,
            entityName,
            decision as 'APPROVED' | 'REJECTED',
            feedback
        );

        res.status(200).json({
            status: 'success',
            data: updatedRequest
        });
    } catch (error) {
        console.error('[IntegrationController] handleIntegrationDecision error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

/**
 * Get pending requests for the current user or target entity
 */
export const getIntegrationRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, entityId } = req.query; // type: 'sent' | 'received'

        let where: any = {};
        if (type === 'sent') {
            where = { userId: req.user?.id };
        } else if (type === 'received' && entityId) {
            where = { targetEntityId: entityId as string };
        } else {
            res.status(400).json({ status: 'error', message: 'Type or entityId missing' });
            return;
        }

        const requests = await prisma.entityIntegrationRequest.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: requests
        });
    } catch (error) {
        console.error('[IntegrationController] getIntegrationRequests error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
