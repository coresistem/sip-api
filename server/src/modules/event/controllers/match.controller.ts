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

        // 5. Create First Round Matches
        const matchesData = [];
        const roundName = size; // e.g. 64, 32, 16...

        for (let i = 0; i < size; i += 2) {
            const seedA = seedOrder[i];
            const seedB = seedOrder[i + 1];

            const regA = registrations[seedA - 1]; // 0-indexed
            const regB = registrations[seedB - 1];

            const athlete1Id = regA ? regA.athleteId : null; // If null, Bye
            const athlete2Id = regB ? regB.athleteId : null;

            // Auto-advance if Bye?
            // If athlete2 is null (Bye), athlete1 auto wins.
            // But we might need to record the match to show it in UI.

            let winnerId = null;
            let status = 'SCHEDULED';
            if (athlete1Id && !athlete2Id) {
                winnerId = athlete1Id;
                status = 'BYE';
            } else if (!athlete1Id && athlete2Id) {
                winnerId = athlete2Id;
                status = 'BYE';
            }

            matchesData.push({
                competitionId,
                categoryId,
                round: size, // Store as "Round of X"
                matchNumber: (i / 2) + 1,
                athlete1Id,
                athlete2Id,
                winnerId,
                status
            });
        }

        // Batch create?
        // We need IDs to link next rounds.
        // It's better to create rounds from Final backwards? Or just create first round and placeholders?
        // Let's create ALL slots.

        // Total matches = size - 1.
        // Round of 8 (4 matches), Round of 4 (2 matches), Final (1 match).

        // Let's build a tree structure in memory then save.
        // Or just save level by level.

        // We need to link `nextMatchId`.
        // So we should build from Final (Round 2) backwards to First Round (Round size).

        // Level 2 (Final): 1 match. ID: ...
        // Level 4 (Semis): 2 matches. NextMatch -> Final.
        // Level 8 (Quarters): 4 matches. NextMatch -> Semis.

        let currentRoundSize = 2; // Start at Final
        let nextRoundMatchIds: string[] = []; // IDs of matches in the *next* round (smaller size)

        // Create Final First
        const finalMatch = await (prisma as any).competitionMatch.create({
            data: {
                competitionId,
                categoryId,
                round: 2,
                matchNumber: 1,
                status: 'SCHEDULED'
            }
        });
        nextRoundMatchIds = [finalMatch.id];

        // Loop backwards from 4 to `size`
        currentRoundSize = 4;
        while (currentRoundSize <= size) {
            const currentRoundMatchIds: string[] = [];

            for (let i = 0; i < currentRoundSize / 2; i++) {
                // Determine parent match (next round)
                const parentMatchIndex = Math.floor(i / 2);
                const nextMatchId = nextRoundMatchIds[parentMatchIndex];

                // Create placeholder match
                const match = await (prisma as any).competitionMatch.create({
                    data: {
                        competitionId,
                        categoryId,
                        round: currentRoundSize,
                        matchNumber: i + 1,
                        nextMatchId,
                        status: 'SCHEDULED'
                    }
                });
                currentRoundMatchIds.push(match.id);
            }

            nextRoundMatchIds = currentRoundMatchIds;
            currentRoundSize *= 2;
        }

        // Now populate the First Round (which is now `size`) with Athletes
        // The last loop iteration created matches for `size`.
        // `nextRoundMatchIds` now holds the match IDs for the first round (Round `size`).
        // Wait, logical error. The loop goes up to `size`.
        // When currentRoundSize == size, we created the empty slots.
        // Now we update them with athletes.

        const firstRoundMatchIds = nextRoundMatchIds;

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
    const isOdd = match.matchNumber % 2 !== 0;

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

export const getBracket = async (req: Request, res: Response) => {
    try {
        const { id, categoryId } = req.params;

        const matches = await (prisma as any).competitionMatch.findMany({
            where: { competitionId: id, categoryId },
            include: {
                athlete1: { include: { user: { select: { name: true } }, club: { select: { name: true } } } },
                athlete2: { include: { user: { select: { name: true } }, club: { select: { name: true } } } }
            },
            orderBy: [{ round: 'desc' }, { matchNumber: 'asc' }]
        });

        res.json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bracket' });
    }
};

export const updateMatchScore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Match ID
        const { score1, score2, sets1, sets2, winnerId, isComplete } = req.body;

        const match = await (prisma as any).competitionMatch.update({
            where: { id },
            data: {
                score1: Number(score1),
                score2: Number(score2), // Wait, schema has athlete1Score string? 
                athlete1Score: JSON.stringify(sets1), // Assuming sets input
                athlete2Score: JSON.stringify(sets2),
                winnerId: isComplete ? winnerId : null,
                status: isComplete ? 'COMPLETED' : 'ONGOING'
            }
        });

        if (isComplete && winnerId) {
            await advanceWinner(id, winnerId);
        }

        res.json({ success: true, data: match });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update match failed' });
    }
};
