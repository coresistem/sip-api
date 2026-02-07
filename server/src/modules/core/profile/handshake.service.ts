import prisma from '../../../lib/prisma.js';

export class HandshakeService {
    /**
     * Checks if a requester (e.g., Club Admin) has a valid, non-expired handshake
     * with a target user (e.g., Athlete).
     */
    static async validateHandshake(requesterId: string, targetUserId: string, targetEntityId?: string) {
        // Fetch user to get their clubId (if they are a Club Admin)
        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
            select: { id: true, role: true, clubId: true, activeRole: true }
        });

        if (!requester) return false;

        const effectiveRole = requester.activeRole || requester.role;

        // SuperAdmin always has access
        if (effectiveRole === 'SUPER_ADMIN') return true;

        // Determine the entity ID to check against
        // If we're checking a Club Admin, we use their clubId
        const activeEntityId = targetEntityId || requester.clubId;

        if (!activeEntityId) return false;

        // Check for active integration request (handshake)
        const handshake = await prisma.entityIntegrationRequest.findFirst({
            where: {
                userId: targetUserId,
                targetEntityId: activeEntityId,
                status: 'APPROVED'
            },
            select: {
                expiresAt: true,
                verificationLevel: true
            }
        });

        if (!handshake) return false;

        // Check TTL (Time-To-Live)
        if (handshake.expiresAt && new Date() > handshake.expiresAt) {
            return false;
        }

        return true;
    }

    /**
     * Extends or sets the TTL for a handshake.
     * Default: 30 days from now.
     */
    static async setTTL(handshakeId: string, days: number = 30) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        return await prisma.entityIntegrationRequest.update({
            where: { id: handshakeId },
            data: { expiresAt }
        });
    }
}
