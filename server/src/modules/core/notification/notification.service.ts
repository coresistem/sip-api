import prisma from '../../../lib/prisma.js';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT' | 'PAYMENT';

export interface ActionPayload {
    type: string;
    id: string;
    data?: any;
}

/**
 * Service to handle system notifications
 */
export class NotificationService {
    /**
     * Send a notification to a specific user
     */
    async notify(
        userId: string,
        data: {
            title: string;
            message: string;
            type?: NotificationType;
            link?: string;
            actionPayload?: ActionPayload;
        }
    ) {
        try {
            return await prisma.notification.create({
                data: {
                    userId,
                    title: data.title,
                    message: data.message,
                    type: data.type || 'INFO',
                    link: data.link,
                    actionPayload: data.actionPayload ? JSON.stringify(data.actionPayload) : null,
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't throw here to prevent blocking the main business logic
            return null;
        }
    }

    /**
     * Specifically notify about a new integration request
     */
    async notifyIntegrationRequest(
        targetUserId: string,
        proposerName: string,
        entityName: string,
        requestId: string
    ) {
        return this.notify(targetUserId, {
            title: 'New Integration Request',
            message: `${proposerName} has requested to join ${entityName}.`,
            type: 'INFO',
            actionPayload: {
                type: 'INTEGRATION_REQUEST',
                id: requestId
            }
        });
    }

    /**
     * Notify about integration decision (Approve/Reject)
     */
    async notifyIntegrationDecision(
        targetUserId: string,
        entityName: string,
        status: 'APPROVED' | 'REJECTED',
        note?: string
    ) {
        const isApproved = status === 'APPROVED';
        return this.notify(targetUserId, {
            title: isApproved ? 'Integration Approved' : 'Integration Rejected',
            message: isApproved
                ? `Welcome! Your request to join ${entityName} has been approved.`
                : `Your request to join ${entityName} was not approved.${note ? ' Note: ' + note : ''}`,
            type: isApproved ? 'SUCCESS' : 'WARNING',
        });
    }
}

export const notificationService = new NotificationService();
