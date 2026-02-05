
import { ScoringRepositoryPort, ScoringRecordDomain } from '../ports/scoring/scoring.repository.port.js';
import prisma from '../../../lib/prisma.js';

export class PrismaScoringAdapter implements ScoringRepositoryPort {
    async create(data: any): Promise<ScoringRecordDomain> {
        return await prisma.scoringRecord.create({
            data,
            include: {
                athlete: { include: { user: { select: { name: true } } } },
                coach: { select: { name: true } }
            }
        }) as unknown as ScoringRecordDomain;
    }

    async findById(id: string): Promise<ScoringRecordDomain | null> {
        return await prisma.scoringRecord.findUnique({
            where: { id },
            include: {
                athlete: { include: { user: { select: { name: true } } } }
            }
        }) as unknown as ScoringRecordDomain;
    }

    async updateVerification(id: string, isVerified: boolean, coachId: string): Promise<ScoringRecordDomain> {
        return await prisma.scoringRecord.update({
            where: { id },
            data: { isVerified, coachId },
            include: {
                athlete: { include: { user: { select: { name: true } } } }
            }
        }) as unknown as ScoringRecordDomain;
    }

    async findMany(where: any, skip: number, take: number): Promise<[ScoringRecordDomain[], number]> {
        const [records, total] = await Promise.all([
            prisma.scoringRecord.findMany({
                where,
                include: {
                    athlete: { include: { user: { select: { name: true } } } },
                    coach: { select: { name: true } }
                },
                skip,
                take,
                orderBy: { sessionDate: 'desc' }
            }),
            prisma.scoringRecord.count({ where })
        ]);
        return [records as unknown as ScoringRecordDomain[], total];
    }

    async findByAthleteId(athleteId: string, limit: number): Promise<ScoringRecordDomain[]> {
        return await prisma.scoringRecord.findMany({
            where: { athleteId },
            orderBy: { sessionDate: 'desc' },
            take: limit
        }) as unknown as ScoringRecordDomain[];
    }
}
