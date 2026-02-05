
import { AthleteRepositoryPort, AthleteDomain } from '../ports/athlete.repository.port.js';
import prisma from '../../../lib/prisma.js';

export class PrismaAthleteAdapter implements AthleteRepositoryPort {
    async findByUserId(userId: string): Promise<AthleteDomain | null> {
        const athlete = await prisma.athlete.findUnique({
            where: { userId },
            include: { user: { select: { name: true, coreId: true } } }
        });

        if (!athlete) return null;

        return {
            id: athlete.id,
            userId: athlete.userId,
            clubId: athlete.clubId,
            coreId: athlete.user.coreId,
            name: athlete.user.name
        };
    }

    async findById(id: string): Promise<AthleteDomain | null> {
        const athlete = await prisma.athlete.findUnique({
            where: { id },
            include: { user: { select: { name: true, coreId: true } } }
        });

        if (!athlete) return null;

        return {
            id: athlete.id,
            userId: athlete.userId,
            clubId: athlete.clubId,
            coreId: athlete.user.coreId,
            name: athlete.user.name
        };
    }
}
