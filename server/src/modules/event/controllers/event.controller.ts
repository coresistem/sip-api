import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';
import * as XLSX from 'xlsx';
// imports removed because dependencies are missing and unused in code

// ==========================================
// COMPETITION MANAGEMENT
// ==========================================

export const createCompetition = async (req: Request, res: Response) => {
    try {
        const {
            name, slug, description,
            venue, address, city, province, country, latitude, longitude,
            startDate, endDate, registrationDeadline,
            level, type, fieldType, rules,
            currency, feeIndividual, feeTeam, feeMixTeam, feeOfficial,
            instagram, website, technicalHandbook, eFlyer,
            competitionCategories
        } = req.body;

        const eoId = req.user?.id;
        if (!eoId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const competition = await (prisma as any).competition.create({
            data: {
                eoId,
                name,
                slug: finalSlug,
                description,
                venue,
                address,
                city,
                province,
                country,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
                status: 'DRAFT',
                level,
                type,
                fieldType: fieldType || 'OUTDOOR',
                rules,
                currency: currency || 'IDR',
                feeIndividual: Number(feeIndividual || 0),
                feeTeam: Number(feeTeam || 0),
                feeMixTeam: Number(feeMixTeam || 0),
                feeOfficial: Number(feeOfficial || 0),
                instagram,
                website,
                technicalHandbook,
                eFlyer,
                categories: {
                    create: (competitionCategories || []).map((cat: any) => ({
                        division: cat.division,
                        ageClass: cat.ageClass,
                        gender: cat.gender,
                        distance: parseInt(cat.distance?.toString().replace('m', '') || '0'),
                        quota: Number(cat.quota || 0),
                        fee: Number(cat.fee || 0),
                        qInd: cat.qInd ?? true,
                        eInd: cat.eInd ?? true,
                        qTeam: cat.qTeam ?? false,
                        eTeam: cat.eTeam ?? false,
                        qMix: cat.qMix ?? false,
                        eMix: cat.eMix ?? false,
                        isSpecial: cat.isSpecial ?? false,
                        categoryLabel: cat.categoryLabel || ''
                    }))
                }
            },
            include: {
                categories: true
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
                },
                schedule: {
                    orderBy: { startTime: 'asc' }
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
            const clubCode = club?.coreId || club?.id.substring(0, 4).toUpperCase() || 'IND';
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
                qualificationScore: { not: null }
            },
            include: {
                athlete: {
                    include: {
                        user: { select: { name: true } },
                        club: { select: { name: true, coreId: true } }
                    }
                },
                category: true
            },
            orderBy: [
                { categoryId: 'asc' },
                { rank: 'asc' },
                { qualificationScore: 'desc' },
                { xCount: 'desc' },
                { tenCount: 'desc' }
            ]
        });

        // Group by Category
        const leaderboard: Record<string, any[]> = {};

        registrations.forEach((reg: any) => {
            const catName = reg.category.categoryLabel || `${reg.category.division} - ${reg.category.gender}`;

            if (!leaderboard[catName]) {
                leaderboard[catName] = [];
            }

            leaderboard[catName].push({
                rank: reg.rank || '-',
                name: reg.athlete.user.name,
                club: reg.athlete.club?.name || 'Individual',
                score: reg.qualificationScore,
                xCount: reg.xCount || 0,
                tenCount: reg.tenCount || 0,
                registrationId: reg.id // Enable certificate download
            });
        });

        res.json({ success: true, data: leaderboard });

    } catch (error) {
        console.error('Get Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};

export const importIanSEORegistrations = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        let updatedCount = 0;
        const errors: string[] = [];

        for (const row of rows) {
            // Flexible Column Mapping for IanSEO or Generic CSV
            // Expected: Rank, Name (or First Name + Last Name), Club, Score
            const rankVal = row['Rank'] || row['rank'] || row['Pos'] || row['pos'];
            const scoreVal = row['Score'] || row['score'] || row['Total'] || row['total'] || row['Qual. Score'];

            // Name matching strategy
            let nameVal = row['Name'] || row['name'] || row['Athlete'] || row['athlete'];
            if (!nameVal && (row['First Name'] || row['Last Name'])) {
                nameVal = `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim();
            }

            // Skip if no name to match
            if (!nameVal) continue;

            // Normalize values
            const rank = parseInt(rankVal) || undefined;
            const score = parseInt(scoreVal) || undefined;

            try {
                // Find existing registration
                // We search by User Name in the Competition Context
                // 1. Find User by Name (loose match?) -> ideally duplicate names are handled by Club check but let's start simple
                // We can query prisma to find the registration directly joining user

                // Find athlete with this name registered in this competition
                const registrations = await (prisma as any).competitionRegistration.findMany({
                    where: {
                        competitionId: id,
                        athlete: {
                            user: {
                                name: { contains: nameVal } // Case sensitive default in some DBs, mostly robust enough
                            }
                        }
                    },
                    include: { athlete: { include: { user: true } } }
                });

                let targetReg = null;
                if (registrations.length === 1) {
                    targetReg = registrations[0];
                } else if (registrations.length > 1) {
                    // Ambiguity - try to match Club if provided
                    const clubVal = row['Club'] || row['club'] || row['Country'] || row['Nation'];
                    // TODO: Implement club match filter if duplicates exist
                    // For now, take exact name match if possible
                    targetReg = registrations.find((r: any) => r.athlete.user.name.toLowerCase() === nameVal.toLowerCase()) || registrations[0];
                }

                if (targetReg) {
                    // Update
                    const updateData: any = {};
                    if (rank !== undefined) updateData.rank = rank;
                    if (score !== undefined) updateData.qualificationScore = score;
                    // Also verify if rank > 0
                    if (updateData.rank || updateData.qualificationScore) {
                        updateData.status = 'VERIFIED';
                        await (prisma as any).competitionRegistration.update({
                            where: { id: targetReg.id },
                            data: updateData
                        });
                        updatedCount++;
                    }
                } else {
                    errors.push(`Athlete not found: ${nameVal}`);
                }

            } catch (err: any) {
                console.error(`Error processing row for ${nameVal}:`, err);
                errors.push(`Error for ${nameVal}: ${err.message}`);
            }
        }

        res.json({
            success: true,
            message: `Processed ${rows.length} rows. Updated ${updatedCount} registrations.`,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: 'Failed to import results', error });
    }
};
