import prisma from '../lib/prisma';

export const LEVELS = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 1500 },
    { level: 7, xp: 2100 },
    { level: 8, xp: 2800 },
    { level: 9, xp: 3600 },
    { level: 10, xp: 4500 },
];

export async function awardXP(athleteId: string, amount: number) {
    try {
        const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
        if (!athlete) return;

        const newXP = athlete.xp + amount;

        // Calculate new level
        let newLevel = athlete.level;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (newXP >= LEVELS[i].xp) {
                newLevel = Math.max(newLevel, LEVELS[i].level);
                break;
            }
        }

        await prisma.athlete.update({
            where: { id: athleteId },
            data: {
                xp: newXP,
                level: newLevel
            }
        });

        // Trigger Badge Checks (simplified)
        await checkBadges(athleteId);

        return { newXP, newLevel };
    } catch (error) {
        console.error('Error awarding XP:', error);
    }
}

export async function checkBadges(athleteId: string) {
    try {
        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },
            include: { scores: true, badges: true }
        });

        if (!athlete) return;

        const earnedBadgeCodes = new Set(athlete.badges.map(b => b.badge.code));

        // Define Badges Logic
        const badgeChecks = [
            {
                code: 'FIRST_SCORE',
                check: () => athlete.scores.length >= 1
            },
            {
                code: '100_ARROWS',
                check: () => athlete.scores.reduce((sum, s) => sum + s.arrowCount, 0) >= 100
            },
            {
                code: 'LEVEL_5',
                check: () => athlete.level >= 5
            }
        ];

        for (const badgeCheck of badgeChecks) {
            if (!earnedBadgeCodes.has(badgeCheck.code) && badgeCheck.check()) {
                // Award Badge
                const badge = await prisma.badge.findUnique({ where: { code: badgeCheck.code } });
                if (badge) {
                    await prisma.athleteBadge.create({
                        data: {
                            athleteId,
                            badgeId: badge.id
                        }
                    });
                    // Recursive XP award for badge? avoid infinite loop
                    // await awardXP(athleteId, badge.xpReward, `Badge Earned: ${badge.name}`);
                }
            }
        }

    } catch (error) {
        console.error('Error checking badges:', error);
    }
}
