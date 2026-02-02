
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class AthleteService {
    async getPerformanceStats(athleteId: string) {
        const registrations = await prisma.competitionRegistration.findMany({
            where: {
                athleteId,
                qualificationScore: { not: null }
            },
            include: {
                competition: {
                    select: {
                        name: true,
                        startDate: true
                    }
                },
                category: {
                    select: {
                        division: true,
                        distance: true,
                        categoryLabel: true,
                        gender: true,
                        ageClass: true
                    }
                }
            },
            orderBy: {
                competition: {
                    startDate: 'asc'
                }
            }
        });

        return registrations.map(reg => ({
            id: reg.id,
            eventId: reg.competitionId,
            eventName: reg.competition.name,
            date: reg.competition.startDate,
            score: reg.qualificationScore,
            xCount: reg.xCount,
            tenCount: reg.tenCount,
            category: {
                label: reg.category.categoryLabel || `${reg.category.division} - ${reg.category.ageClass}`,
                division: reg.category.division,
                distance: reg.category.distance
            }
        }));
    }

    // ... we can migrate other methods here later or now. 
    // For now, let's keep it minimal to unblock the feature, 
    // but ideally we should refactor the whole module.
    // Given the task is just "Implement Performance Charts", I will stick to adding this.
    // But since I have to touch the routes file anyway, I might as well move the logic.
    // Let's tackle the new feature first to be safe.
}
