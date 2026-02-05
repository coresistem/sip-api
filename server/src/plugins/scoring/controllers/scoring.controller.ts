
import { Request, Response } from 'express';
import { ScoringRepositoryPort } from '../../../modules/core/ports/scoring/scoring.repository.port.js';
import { AthleteRepositoryPort } from '../../../modules/core/ports/athlete.repository.port.js';
import { PrismaScoringAdapter } from '../../../modules/core/adapters/prisma-scoring.adapter.js';
import { PrismaAthleteAdapter } from '../../../modules/core/adapters/prisma-athlete.adapter.js';

export class ScoringController {
    constructor(
        private scoringRepo: ScoringRepositoryPort = new PrismaScoringAdapter(),
        private athleteRepo: AthleteRepositoryPort = new PrismaAthleteAdapter()
    ) { }

    submitScore = async (req: Request, res: Response) => {
        try {
            let { athleteId, sessionDate, sessionType, distance, arrowScores } = req.body;

            // Logic to find athlete if not provided
            if (!athleteId && req.user?.role === 'ATHLETE') {
                const athlete = await this.athleteRepo.findByUserId(req.user.id);
                if (athlete) athleteId = athlete.id;
            }

            if (!athleteId) return res.status(400).json({ success: false, message: 'Athlete ID required' });

            // Basic totals calculation (Extracted from old route)
            const allArrows = arrowScores.flat();
            const totalSum = allArrows.reduce((sum: number, s: any) => sum + (s === 'X' ? 10 : (s === 'M' ? 0 : Number(s))), 0);

            const score = await this.scoringRepo.create({
                ...req.body,
                athleteId,
                sessionDate: new Date(sessionDate),
                arrowScores: JSON.stringify(arrowScores),
                totalSum,
                arrowCount: allArrows.length,
                average: allArrows.length > 0 ? totalSum / allArrows.length : 0,
                tensCount: allArrows.filter((s: any) => s === 10 || s === 'X' || s === '10').length,
                xCount: allArrows.filter((s: any) => s === 'X' || s === 11).length,
                coachId: req.user?.role !== 'ATHLETE' ? req.user?.id : null
            });

            res.status(201).json({ success: true, data: score });
        } catch (error) {
            console.error('Plugin Scoring Error:', error);
            res.status(500).json({ success: false, message: 'Failed to submit score via plugin' });
        }
    }

    getMyScores = async (req: Request, res: Response) => {
        try {
            const athlete = await this.athleteRepo.findByUserId(req.user!.id);
            if (!athlete) return res.json({ success: true, data: [] });

            const scores = await this.scoringRepo.findByAthleteId(athlete.id, Number(req.query.limit) || 10);
            res.json({ success: true, data: scores });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch scores' });
        }
    }
}

export const scoringController = new ScoringController();
