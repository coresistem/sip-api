import prisma from '../../../lib/prisma.js';

export interface AuditLogOptions {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditService {
    /**
     * Records an audit log entry.
     * Standardizes the way we log sensitive actions in the system.
     */
    async log(options: AuditLogOptions) {
        try {
            const {
                userId,
                action,
                entity,
                entityId,
                oldValues,
                newValues,
                metadata,
                ipAddress,
                userAgent,
            } = options;

            const logEntry = await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entity,
                    entityId,
                    oldValues: oldValues ? JSON.stringify(oldValues) : null,
                    newValues: newValues ? JSON.stringify(newValues) : null,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                    ipAddress,
                    userAgent,
                },
            });

            console.log(`[AuditService] Action logged: ${action} on ${entity} by ${userId}`);
            return logEntry;
        } catch (error) {
            console.error('[AuditService] Failed to create audit log:', error);
            // We don't throw error here to avoid breaking the main business flow
        }
    }

    /**
     * Specialized logger for integration requests.
     */
    async logIntegration(userId: string, targetId: string, action: string, context: any) {
        return this.log({
            userId,
            entity: 'EntityIntegration',
            entityId: targetId,
            action,
            metadata: context
        });
    }
}

export const auditService = new AuditService();
