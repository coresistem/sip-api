import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

// ==========================================
// ELIMINATION BRACKET MANAGEMENT
// ==========================================

export const generateBracket = async (req: Request, res: Response) => {
    try {
        const { competitionId, categoryId } = req.body;

        // 1. Get all qualified athletes (those with scores)
        const registrations = await (prisma as any).competitionRegistration.findMany({
            where: {
                competitionId,
                categoryId,
                qualificationScore: { not: null }
            },
            orderBy: [
                { qualificationScore: 'desc' },
                { xCount: 'desc' }, // Updated Rule 2026: X count first
                { tenCount: 'desc' }
            ],
            include: { athlete: true }
        });

        if (registrations.length < 2) {
            return res.status(400).json({ success: false, message: 'Not enough qualified athletes to generate bracket' });
        }

        // 2. Determine Bracket Size (Total of 2, 4, 8, 16, 32, 64, 128)
        const count = registrations.length;
        let size = 2;
        while (size < count) size *= 2;

        // If explicitly requested smaller cut (e.g. Top 32 only), we could handle that here.
        // For now, we take everyone and give BYEs if needed.
        // But commonly, brackets are fixed sizes like 1/16 (32 people).
        // Let's create a bracket for `size`.

        // 3. Clear existing matches for this category??
        // Dangerous if matches already started.
        const existingMatches = await (prisma as any).competitionMatch.count({
            where: { categoryId, status: { not: 'SCHEDULED' } } // If any match started
        });

        if (existingMatches > 0) {
            return res.status(400).json({ success: false, message: 'Matches already in progress. Cannot regenerate.' });
        }

        // Delete all scheduled matches
        await (prisma as any).competitionMatch.deleteMany({
            where: { categoryId }
        });

        // 4. Seed positions
        // Standard seeding for size N:
        // Match 1: Seed 1 vs Seed N
        // Match 2: Seed 2 vs Seed N-1
        // But typical brackets are arranged so 1 and 2 meet in final.

        // Helper to generate seed pairings
        // e.g. for 4: [1, 4, 2, 3] -> Match 1: (1,4), Match 2: (2,3)??
        // No, typically top-down:
        // Round of 16 match order is specific.

        // Simple algorithm:
        // Create an array of seeds [1, 2, ..., size]
        // If seed > count, it's a BYE.

        // Let's implement recursive pairing or find a library/snippet for standard bracket seeding.
        // For size 8:
        // 1 vs 8
        // 4 vs 5
        // 3 vs 6
        // 2 vs 7
        // Wait, standard order is: 1-8, 5-4, 3-6, 7-2

        const getSeedOrder = (n: number): number[] => {
            if (n === 2) return [1, 2];
            const prev = getSeedOrder(n / 2);
            // For each pair in prev, replace k with k, n+1-k
            const next: number[] = [];
            for (const p of prev) {
                next.push(p);
                next.push(n + 1 - p);
            }
            return next;
        };

        const seedOrder = getSeedOrder(size);
        // seedOrder for 4: [1, 4, 2, 3] -> (1 vs 4), (2 vs 3) if strictly following index 0-1, 2-3...
        // Wait, normally pairs are: (0,1), (2,3), etc.
        // 1 vs 4
        // 2 vs 3
        // So pairs are chunks of 2.

        // 5. Create Bracket Structure from Final backwards
        // Level 2 (Final & Bronze):
        // Round 2, Match 1: GOLD MATCH (Final)
        // Round 2, Match 2: BRONZE MATCH (Only if 4+ athletes)
        const finalMatch = await (prisma as any).competitionMatch.create({
            data: {
                competitionId,
                categoryId,
                round: 2,
                matchNo: 1,
                status: 'SCHEDULED'
            }
        });

        let bronzeMatchId: string | null = null;
        if (size >= 4) {
            const bronzeMatch = await (prisma as any).competitionMatch.create({
                data: {
                    competitionId,
                    categoryId,
                    round: 2,
                    matchNo: 2,
                    status: 'SCHEDULED'
                }
            });
            bronzeMatchId = bronzeMatch.id;
        }

        // Round of 4 (Semis) - Special case because losers go to Bronze
        const semiRoundMatchIds: string[] = [];
        if (size >= 4) {
            for (let i = 0; i < 2; i++) {
                const match = await (prisma as any).competitionMatch.create({
                    data: {
                        competitionId,
                        categoryId,
                        round: 4,
                        matchNo: i + 1,
                        nextMatchId: finalMatch.id,
                        loserMatchId: bronzeMatchId,
                        status: 'SCHEDULED'
                    }
                });
                semiRoundMatchIds.push(match.id);
            }
        } else {
            // If only 2 athletes, first round is the final match.
            // But usually size is at least 2.
        }

        let nextRoundMatchIds = semiRoundMatchIds;
        let currentRoundSize = 8;

        // Loop from 8 to `size`
        while (currentRoundSize <= size) {
            const currentRoundMatchIds: string[] = [];

            for (let i = 0; i < currentRoundSize / 2; i++) {
                const parentMatchIndex = Math.floor(i / 2);
                const nextMatchId = nextRoundMatchIds[parentMatchIndex];

                const match = await (prisma as any).competitionMatch.create({
                    data: {
                        competitionId,
                        categoryId,
                        round: currentRoundSize,
                        matchNo: i + 1,
                        nextMatchId,
                        status: 'SCHEDULED'
                    }
                });
                currentRoundMatchIds.push(match.id);
            }

            nextRoundMatchIds = currentRoundMatchIds;
            currentRoundSize *= 2;
        }

        // Now populate the First Round athletes
        const firstRoundMatchIds = size === 2 ? [finalMatch.id] : nextRoundMatchIds;

        // Now populate the First Round (which is now `size`) with Athletes
        // The last loop iteration created matches for `size`.
        // `nextRoundMatchIds` now holds the match IDs for the first round (Round `size`).
        // Wait, logical error. The loop goes up to `size`.
        // When currentRoundSize == size, we created the empty slots.
        // Now we update them with athletes.

        for (let i = 0; i < size / 2; i++) {
            const seedA = seedOrder[i * 2]; // 1
            const seedB = seedOrder[i * 2 + 1]; // 4

            const regA = registrations[seedA - 1];
            const regB = registrations[seedB - 1];

            const matchId = firstRoundMatchIds[i];

            const athlete1Id = regA ? regA.athleteId : null;
            const athlete2Id = regB ? regB.athleteId : null;

            let winnerId = null;
            let status = 'SCHEDULED';

            // Handle BYEs
            if (athlete1Id && !athlete2Id) {
                winnerId = athlete1Id;
                status = 'BYE';
            } else if (!athlete1Id && athlete2Id) {
                // Should not happen with standard seeding top-heavy, but possible if random
                winnerId = athlete2Id;
                status = 'BYE';
            }

            await (prisma as any).competitionMatch.update({
                where: { id: matchId },
                data: {
                    athlete1Id,
                    athlete2Id,
                    winnerId,
                    status
                }
            });

            // If BYE, we must Auto-Advance the winner to the next round immediately
            if (status === 'BYE' && winnerId) {
                await advanceWinner(matchId, winnerId);
            }
        }

        res.json({ success: true, message: 'Bracket generated successfully', size });

    } catch (error) {
        console.error('Generate Bracket Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate bracket' });
    }
};

const advanceWinner = async (matchId: string, winnerId: string) => {
    // Find the match to get nextMatchId
    const match = await (prisma as any).competitionMatch.findUnique({ where: { id: matchId } });
    if (!match || !match.nextMatchId) return; // Final match has no next

    // Is this winner coming from top or bottom of the bracket pair?
    // A match feeds into a slot in the next match.
    // Matches 1 & 2 -> Feed into Match 1 of next round.
    // Match 1 is "Top", Match 2 is "Bottom".
    // We can know this by matchNumber check?
    // Match Number 1 (Odd) -> Athlete 1 position in next match?
    // Match Number 2 (Even) -> Athlete 2 position?

    // Logic: 
    // If matchNumber is Odd (1, 3, 5...), it feeds nextMatch.athlete1
    // If matchNumber is Even (2, 4, 6...), it feeds nextMatch.athlete2

    // Wait, matchNumber index starts at 1.
    const isOdd = match.matchNo % 2 !== 0;

    const updateData: any = {};
    if (isOdd) {
        updateData.athlete1Id = winnerId;
    } else {
        updateData.athlete2Id = winnerId;
    }

    await (prisma as any).competitionMatch.update({
        where: { id: match.nextMatchId },
        data: updateData
    });
};

const advanceLoser = async (matchId: string, loserId: string) => {
    const match = await (prisma as any).competitionMatch.findUnique({ where: { id: matchId } });
    if (!match || !match.loserMatchId) return;

    // Loser logic for Bronze Match:
    // Semifinal 1 (matchNo 1) Loser -> Bronze Athlete 1
    // Semifinal 2 (matchNo 2) Loser -> Bronze Athlete 2
    const isFirstSemi = match.matchNo === 1;
    const updateData: any = {};
    if (isFirstSemi) {
        updateData.athlete1Id = loserId;
    } else {
        updateData.athlete2Id = loserId;
    }

    await (prisma as any).competitionMatch.update({
        where: { id: match.loserMatchId },
        data: updateData
    });
};

export const getBracket = async (req: Request, res: Response) => {
    try {
        const { id, categoryId } = req.params;

        const matches = await (prisma as any).competitionMatch.findMany({
            where: { competitionId: id, categoryId },
            include: {
                athlete1: { include: { user: { select: { name: true } }, club: { select: { name: true } } } },
                athlete2: { include: { user: { select: { name: true } }, club: { select: { name: true } } } }
            },
            orderBy: [{ round: 'desc' }, { matchNo: 'asc' }]
        });

        res.json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bracket' });
    }
};

export const updateMatchScore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Match ID
        const { score1, score2, sets1, sets2, winnerId, isComplete, shootOff1, shootOff2 } = req.body;

        const currentMatch = await (prisma as any).competitionMatch.findUnique({ where: { id } });
        if (!currentMatch) throw new Error('Match not found');

        const match = await (prisma as any).competitionMatch.update({
            where: { id },
            data: {
                score1: Number(score1),
                score2: Number(score2),
                sets1: JSON.stringify(sets1), // Assuming sets input
                sets2: JSON.stringify(sets2),
                shootOff1: Number(shootOff1 || 0),
                shootOff2: Number(shootOff2 || 0),
                winnerId: isComplete ? winnerId : null,
                status: isComplete ? 'COMPLETED' : 'ONGOING'
            }
        });

        if (isComplete && winnerId) {
            await advanceWinner(id, winnerId);

            // Advance Loser if there is a loserMatchId (e.g. for Semis to Bronze)
            if (currentMatch.loserMatchId) {
                const loserId = winnerId === currentMatch.athlete1Id ? currentMatch.athlete2Id : currentMatch.athlete1Id;
                if (loserId) {
                    await advanceLoser(id, loserId);
                }
            }
        }

        res.json({ success: true, data: match });
    } catch (error) {
        console.error('Update score error:', error);
        res.status(500).json({ success: false, message: 'Update match failed' });
    }
};
