import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

export const getCategoryParticipants = async (req: Request, res: Response) => {
    try {
        const { id, categoryId } = req.params;
        const participants = await prisma.competitionRegistration.findMany({
            where: {
                competitionId: id,
                categoryId: categoryId,
            },
            include: {
                athlete: {
                    include: {
                        user: {
                            select: { name: true, avatarUrl: true }
                        },
                        club: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        res.json({ success: true, data: participants });
    } catch (error) {
        console.error('Get Participants Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch participants' });
    }
};

export const getCompetitionLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id, categoryId } = req.params;
        const leaderboard = await prisma.competitionRegistration.findMany({
            where: {
                competitionId: id,
                categoryId: categoryId
            },
            orderBy: [
                { qualificationScore: 'desc' },
                { tenCount: 'desc' },
                { xCount: 'desc' }
            ],
            include: {
                athlete: {
                    include: {
                        user: {
                            select: { name: true, avatarUrl: true }
                        },
                        club: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Get Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};

export const getActiveCompetitionsForScoring = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        const filter: any = {
            status: { in: ['OPEN_REGISTRATION', 'ONGOING', 'COMPLETED'] }
        };

        // If EO, limit to their competitions
        if (role === 'EO') {
            filter.eoId = userId;
        }

        const competitions = await prisma.competition.findMany({
            where: filter,
            orderBy: { startDate: 'desc' },
            select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                location: true,
                categories: {
                    select: {
                        id: true,
                        division: true,
                        ageClass: true,
                        gender: true,
                        distance: true,
                        categoryLabel: true
                    }
                }
            }
        });

        res.json({ success: true, data: competitions });
    } catch (error) {
        console.error('Get Active Competitions Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active competitions' });
    }
};
