import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';
// imports removed because dependencies are missing and unused in code

// ==========================================
// COMPETITION MANAGEMENT
// ==========================================

export const createCompetition = async (req: Request, res: Response) => {
    try {
        const { name, slug, location, city, startDate, endDate, description } = req.body;
        const eoId = req.user?.id;

        if (!eoId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const competition = await (prisma as any).competition.create({
            data: {
                eoId,
                name,
                slug,
                location,
                city,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: 'DRAFT'
            }
        });

        res.status(201).json({ success: true, data: competition });
    } catch (error) {
        console.error('Create competition error:', error);
        res.status(500).json({ success: false, message: 'Failed to create competition', error });
    }
};

export const getCompetitions = async (req: Request, res: Response) => {
    try {
        const competitions = await (prisma as any).competition.findMany({
            where: { status: { not: 'DRAFT' } },
            orderBy: { startDate: 'asc' },
            include: {
                categories: true,
                _count: { select: { registrations: true } }
            }
        });
        res.json({ success: true, data: competitions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching competitions' });
    }
};

export const getCompetitionDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find current athlete ID if user is logged in
        let myAthleteId = 'xxx';
        if (req.user) {
            const athlete = await prisma.athlete.findUnique({ where: { userId: req.user.id } });
            if (athlete) myAthleteId = athlete.id;
        }

        const competition = await (prisma as any).competition.findUnique({
            where: { id },
            include: {
                categories: {
                    include: {
                        _count: { select: { registrations: true } }
                    }
                },
                registrations: {
                    where: { athleteId: myAthleteId }
                }
            }
        });

        if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

        res.json({ success: true, data: competition });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching details' });
    }
};

// ==========================================
// CATEGORIES
// ==========================================

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Competition ID
        const { division, ageClass, gender, distance, quota, fee } = req.body;

        // Check ownership
        const competition = await (prisma as any).competition.findUnique({ where: { id } });
        if (!competition || competition.eoId !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const category = await (prisma as any).competitionCategory.create({
            data: {
                competitionId: id,
                division,
                ageClass,
                gender,
                distance: Number(distance),
                quota: Number(quota),
                fee: Number(fee)
            }
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add category' });
    }
};

// ==========================================
// REGISTRATION
// ==========================================

export const registerAthlete = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const athlete = await prisma.athlete.findUnique({ where: { userId: req.user.id } });
        if (!athlete) {
            return res.status(400).json({ success: false, message: 'Only athletes can register' });
        }
        const athleteId = athlete.id;

        // Check category exists and quota
        const category = await (prisma as any).competitionCategory.findUnique({
            where: { id: categoryId },
            include: { _count: { select: { registrations: true } } }
        });

        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        if (category.quota > 0 && category._count.registrations >= category.quota) {
            return res.status(400).json({ success: false, message: 'Quota full' });
        }

        const registration = await (prisma as any).competitionRegistration.create({
            data: {
                competitionId: category.competitionId,
                categoryId,
                athleteId
            }
        });

        res.status(201).json({ success: true, data: registration });
    } catch (error) {
        if ((error as any).code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Already registered' });
        }
        res.status(500).json({ success: false, message: 'Registration failed', error });
    }
};
// ==========================================
// EXPORT / IMPORT
// ==========================================

export const exportIanSEORegistrations = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Get registrations
        const registrations = await (prisma as any).competitionRegistration.findMany({
            where: {
                competitionId: id,
                status: { in: ['PAID', 'VERIFIED', 'PENDING'] } // Allowing PENDING for testing flexibility, usually mostly PAID
            },
            include: {
                athlete: {
                    include: {
                        user: true,
                        club: true
                    }
                },
                category: true
            }
        });

        if (!registrations.length) {
            return res.status(404).json({ success: false, message: 'No registrations found to export' });
        }

        // 2. Map to CSV Rows
        // Header based on user provided sample
        const header = "1) Bib,2) Session,3) Division,4) Class,5) Target,6) Individual - Division/Class,7) Team - Division/Class,8) Ind. Events,9) Team Events,10) Mixed Team Events,11) Last Name,12) Name,13) Gender,14) Country or State Code,15) Country Name,16) Date of Birth,17) Subclass,18) Country or State Code 2,19) Country Name 2,CATATAN";

        const rows = registrations.map((reg: any, index: number) => {
            const athlete = reg.athlete;
            const user = athlete.user;
            const club = athlete.club;
            const category = reg.category;

            // Mappings
            // Division: RECURVE->R, COMPOUND->C, BAREBOW->B, STANDARD->N (National/Standard), TRADITIONAL->T
            const divMap: Record<string, string> = {
                'RECURVE': 'R',
                'COMPOUND': 'C',
                'BAREBOW': 'B',
                'National': 'N',
                'TRADITIONAL': 'T'
            };
            const division = divMap[category.division] || category.division?.charAt(0).toUpperCase() || 'R';

            // Gender/Class: MALE->M, FEMALE->W
            const genderCode = category.gender === 'FEMALE' ? 'W' : 'M';

            // Bib: Use existing or generate sequential (1000 + index)
            const bib = athlete.athleteIdNumber || (1000 + index + 1).toString();

            // Club info
            const clubCode = club?.sipId || club?.id.substring(0, 4).toUpperCase() || 'IND';
            const clubName = club?.name || 'Individual';

            // IanSEO Columns
            // 1) Bib
            // 2) Session (Default 1)
            // 3) Division
            // 4) Class (Gender code usually used here too)
            // 5) Target (Empty)
            // 6) Individual (1)
            // 7) Team (0)
            // 8) Ind. Events (1)
            // 9) Team Events (0)
            // 10) Mixed Team Events (0)
            // 11) Last Name (Full Name)
            // 12) Name (Empty in sample)
            // 13) Gender (M/W)
            // 14) Country Code (Club Code)
            // 15) Country Name (Club Name)

            // Helper to escape CSV
            const safe = (val: any) => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            return [
                safe(bib),                  // 1 Bib
                "1",                        // 2 Session
                safe(division),             // 3 Division
                safe(genderCode),           // 4 Class
                "",                         // 5 Target
                "1",                        // 6 Individual
                "0",                        // 7 Team
                "1",                        // 8 Ind. Events
                "0",                        // 9 Team Events
                "0",                        // 10 Mixed Team
                safe(user.name),            // 11 Last Name (Full)
                "",                         // 12 Name
                safe(genderCode),           // 13 Gender
                safe(clubCode),             // 14 Country Code
                safe(clubName),             // 15 Country Name
                safe(athlete.dateOfBirth?.toISOString().split('T')[0]), // 16 DOB
                "",                         // 17 Subclass
                "",                         // 18 Code 2
                "",                         // 19 Name 2
                ""                          // CATATAN
            ].join(',');
        });

        const csvContent = [header, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ianseo_export_${id}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Export IanSEO error:', error);
        res.status(500).json({ success: false, message: 'Failed to export', error });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch all completed/scored registrations
        const registrations = await (prisma as any).competitionRegistration.findMany({
            where: {
                competitionId: id,
                // We only want those with scores or specifically marked as completed/scored.
                // Assuming 'COMPLETED' or verification of qualificationScore > 0
                qualificationScore: { not: null }
            },
            include: {
                athlete: {
                    include: {
                        user: { select: { name: true } },
                        club: { select: { name: true, sipId: true } }
                    }
                },
                category: true
            },
            orderBy: [
                { categoryId: 'asc' }, // Group by category
                { rank: 'asc' }, // Use Rank first (if imported)
                { qualificationScore: 'desc' } // Fallback to score
            ]
        });

        // Group by Category
        // Shape: { [categoryName]: [ { rank, name, club, score, ... } ] }
        const leaderboard: Record<string, any[]> = {};

        registrations.forEach((reg: any) => {
            // Construct meaningful category name (e.g., "Recurve Men - 70m")
            const catName = `${reg.category.division} - ${reg.category.gender}`;

            if (!leaderboard[catName]) {
                leaderboard[catName] = [];
            }

            leaderboard[catName].push({
                rank: reg.rank || '-',
                name: reg.athlete.user.name,
                club: reg.athlete.club?.name || 'Individual',
                score: reg.qualificationScore,
                xCount: 0,
                tenCount: 0
            });
        });

        res.json({ success: true, data: leaderboard });

    } catch (error) {
        console.error('Get Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};
