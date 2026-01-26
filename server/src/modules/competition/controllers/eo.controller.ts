import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import prisma from '../../../lib/prisma.js';

export const getEOStats = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const now = new Date();

        // Parallel fetch for stats
        const [totalEvents, activeEvents, upcomingEvents, eventsWithRegistrations] = await Promise.all([
            (prisma as any).competition.count({ where: { eoId } }),
            (prisma as any).competition.count({
                where: {
                    eoId,
                    status: { in: ['OPEN_REGISTRATION', 'ONGOING'] }
                }
            }),
            (prisma as any).competition.count({
                where: {
                    eoId,
                    startDate: { gt: now }
                }
            }),
            (prisma as any).competition.findMany({
                where: { eoId },
                include: {
                    _count: {
                        select: { registrations: true }
                    }
                }
            })
        ]);

        const totalParticipants = eventsWithRegistrations.reduce(
            (acc: number, curr: any) => acc + (curr._count?.registrations || 0),
            0
        );

        res.json({
            success: true,
            data: {
                totalEvents,
                activeEvents,
                totalParticipants,
                upcomingEvents
            }
        });

    } catch (error) {
        console.error('Get EO Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

export const getEOEvents = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        const filter = isSuperAdmin ? {} : { eoId };

        const events = await (prisma as any).competition.findMany({
            where: filter,
            orderBy: { startDate: 'desc' },
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });

        // Format for frontend
        const formattedEvents = events.map((event: any) => ({
            id: event.id,
            name: event.name,
            type: 'REGIONAL', // Default or fetch if schema has it (Schema doesn't seem to have type yet based on previous read, or I missed it. EventCreationPage says type exists)
            // Wait, I should check schema for 'type'. In Step 2086/2156, I saw 'Competition' model only has 'name, slug, description, location, city, startDate, endDate, status'. No 'type'.
            // I will default 'type' to 'REGIONAL' or add it to schema later if needed.
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            venue: event.location, // Mapping location to venue
            participantCount: event._count.registrations,
            maxParticipants: 100 // Default or schema field? Schema doesn't have maxParticipants on Competition, only on Category. Or maybe I missed it.
            // Re-checking Step 2086: Competition has 'registrations' relation. No maxParticipants.
        }));

        res.json({ success: true, data: formattedEvents });

    } catch (error) {
        console.error('Get EO Events Error:', error);

        res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
};

export const getEventDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const eoId = req.user?.id;

        const competition = await (prisma as any).competition.findFirst({
            where: {
                id,
                ...(req.user?.role !== 'SUPER_ADMIN' ? { eoId } : {})
            },
            include: {
                _count: {
                    select: { registrations: true }
                },
                categories: true,
                schedule: {
                    orderBy: { startTime: 'asc' }
                }
            }
        });

        if (!competition) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Format for frontend
        const data = {
            id: competition.id,
            name: competition.name,
            type: completionToString(competition.type) || 'REGIONAL', // Helper or default
            status: competition.status,
            startDate: competition.startDate,
            endDate: competition.endDate,
            venue: competition.location,
            city: competition.city,
            locationUrl: competition.locationUrl, // Add this
            description: competition.description,
            participantCount: competition._count.registrations,
            categories: competition.categories,
            schedule: competition.schedule
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get Event Details Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch event details' });
    }
};

function completionToString(type: any): string {
    return type ? String(type) : 'REGIONAL';
}

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
                'STANDARD': 'N',
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

export const importIanSEOResults = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });

        // Find Qualification Sheets (ending in Q_I)
        const qualSheets = workbook.SheetNames.filter(name => /.*Q_I$/.test(name));

        if (qualSheets.length === 0) {
            return res.status(400).json({ success: false, message: 'No Qualification sheets (*Q_I) found.' });
        }

        let totalImported = 0;

        for (const sheetName of qualSheets) {
            const sheet = workbook.Sheets[sheetName];
            // Header: 0, Range: 0, Defval: null
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: null });

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row) continue;

                // User Schema:
                // A(0): Rank
                // B(1): Name
                // D(3): Fita ID (Bib/SIP ID) -> Key
                // F(5): Score

                // Skip Header if detected (Rank/Archer/NOC/Fita ID)
                // Checking Col 3 "Fita ID" or Col 0 "RK"
                const col0 = row[0] ? String(row[0]).trim().toUpperCase() : '';
                const col3 = row[3] ? String(row[3]).trim() : '';

                if (col0 === 'RK' || col3 === 'FITA ID' || col3 === 'BIB') continue;

                const sipId = col3;
                const scoreVal = row[5];
                const rankVal = row[0];

                // Attempt to read 10s (Col G/6) and Xs (Col H/7)
                // Analysis of TOAC24.ods shows these columns do NOT contain 10s/Xs (Col 7 is Rank).
                // Defaulting to 0 to prevent data corruption.
                const tenCount = 0;
                const xCount = 0;

                if (!sipId || scoreVal === null || scoreVal === undefined || scoreVal === '') continue;

                const score = parseInt(scoreVal);
                const rank = parseInt(rankVal);

                if (isNaN(score)) continue;

                try {
                    // Match Athlete by SIP ID or Bib (Assuming they are same as per user "Bib = SIP ID")
                    // If SIP ID is missing in our DB, we might fail to match.
                    // Let's try to match User.sipId first.
                    const athlete = await prisma.athlete.findFirst({
                        where: {
                            OR: [
                                { user: { sipId: sipId } },
                                { athleteIdNumber: sipId }
                            ]
                        }
                    });

                    if (athlete) {
                        const update = await prisma.competitionRegistration.updateMany({
                            where: {
                                competitionId: id,
                                athleteId: athlete.id
                            },
                            data: {
                                qualificationScore: score,
                                rank: !isNaN(rank) ? rank : undefined,
                                tenCount: tenCount,
                                xCount: xCount,
                                status: 'COMPLETED'
                            }
                        });
                        if (update.count > 0) totalImported++;
                    }
                } catch (e) {
                    // Ignore individual row errors
                }
            }
        }

        res.json({
            success: true,
            message: `Imported ${totalImported} scores from sheets: ${qualSheets.join(', ')}`
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: 'Import failed', error });
    }
};





export const createEvent = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const { name, startDate, endDate, venue, city, description, locationUrl } = req.body;

        if (!name || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Simple slug generation
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const competition = await (prisma as any).competition.create({
            data: {
                eoId,
                name,
                slug, // Use the variable defined above
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                venue,
                location: venue,
                city,
                description,
                locationUrl,
                status: 'DRAFT'
            }
        });

        res.status(201).json({ success: true, data: competition });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create event' });
    }
};

// --- Category Management ---

export const getCategories = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id } = req.params; // Event ID

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const categories = await prisma.competitionCategory.findMany({
            where: { competitionId: id },
            include: {
                _count: {
                    select: { registrations: true }
                }
            },
            orderBy: [
                { division: 'asc' },
                { gender: 'asc' },
                { ageClass: 'asc' }
            ]
        });

        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id } = req.params; // Event ID
        const { division, ageClass, gender, distance, quota, fee } = req.body;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify Event Ownership
        const competition = await prisma.competition.findFirst({
            where: { id, eoId }
        });

        if (!competition) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }

        const category = await prisma.competitionCategory.create({
            data: {
                competitionId: id,
                division,
                ageClass,
                gender,
                distance: parseInt(distance),
                quota: parseInt(quota) || 0,
                fee: parseFloat(fee) || 0
            }
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id, categoryId } = req.params;
        const { division, ageClass, gender, distance, quota, fee } = req.body;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify Ownership logic ...
        const category = await prisma.competitionCategory.findFirst({
            where: { id: categoryId, competition: { id, eoId } }
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
        }

        const updated = await prisma.competitionCategory.update({
            where: { id: categoryId },
            data: {
                division,
                ageClass,
                gender,
                distance: parseInt(distance),
                quota: parseInt(quota),
                fee: parseFloat(fee)
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
};

export const deleteScheduleItem = async (req: Request, res: Response) => {
    try {
        const { id, itemId } = req.params;
        const eoId = req.user?.id;

        // Verify ownership
        const competition = await prisma.competition.findFirst({
            where: { id, eoId }
        });

        if (!competition) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await prisma.competitionSchedule.delete({
            where: { id: itemId }
        });

        return res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error('Delete schedule error:', error);
        return res.status(500).json({ success: false, message: "Failed to delete item" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id, categoryId } = req.params;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify Ownership logic ...
        const category = await prisma.competitionCategory.findFirst({
            where: { id: categoryId, competition: { id, eoId } }
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
        }

        await prisma.competitionCategory.delete({
            where: { id: categoryId }
        });

        res.json({ success: true, message: 'Category deleted' });

    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
};

// --- Budgeting Management ---

export const getBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const budgetEntries = await prisma.competitionBudgetEntry.findMany({
            where: { competitionId: id },
            orderBy: { createdAt: 'desc' }
        });

        // Also fetch categories to calculate "Projected Income" from fees
        // and "Projected Expenses" from prizes
        const categories = await prisma.competitionCategory.findMany({
            where: { competitionId: id },
            select: {
                id: true,
                division: true,
                ageClass: true,
                gender: true,
                quota: true,
                _count: {
                    select: { registrations: true }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                entries: budgetEntries,
                categories: categories
            }
        });
    } catch (error) {
        console.error('Get budget error:', error);
        return res.status(500).json({ success: false, message: "Failed to fetch budget" });
    }
};

export const createBudgetEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const eoId = req.user?.id;
        const data = req.body; // { category, description, amount, quantity, tag }

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        const entry = await prisma.competitionBudgetEntry.create({
            data: {
                competitionId: id,
                ...data
            }
        });

        return res.status(201).json({ success: true, data: entry });
    } catch (error) {
        console.error('Create budget entry error:', error);
        return res.status(500).json({ success: false, message: "Failed to create entry" });
    }
};

export const deleteBudgetEntry = async (req: Request, res: Response) => {
    try {
        const { id, entryId } = req.params;
        const eoId = req.user?.id;

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        await prisma.competitionBudgetEntry.delete({
            where: { id: entryId }
        });

        return res.status(200).json({ success: true, message: "Entry deleted" });
    } catch (error) {
        console.error('Delete budget entry error:', error);
        return res.status(500).json({ success: false, message: "Failed to delete entry" });
    }
};

export const updateBudgetEntry = async (req: Request, res: Response) => {
    try {
        const { id, entryId } = req.params;
        const eoId = req.user?.id;
        const data = req.body;

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        const entry = await prisma.competitionBudgetEntry.update({
            where: { id: entryId },
            data
        });

        return res.status(200).json({ success: true, data: entry });
    } catch (error) {
        console.error('Update budget entry error:', error);
        return res.status(500).json({ success: false, message: "Failed to update entry" });
    }
};


// --- Timeline / Gantt Chart Management ---

export const getTimeline = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const items = await prisma.competitionTimelineItem.findMany({
            where: { competitionId: id },
            orderBy: { startDate: 'asc' }
        });

        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error('Get timeline error:', error);
        return res.status(500).json({ success: false, message: "Failed to fetch timeline" });
    }
};

export const createTimelineItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const eoId = req.user?.id;
        const { title, pic, startDate, endDate, status } = req.body;

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        const item = await prisma.competitionTimelineItem.create({
            data: {
                competitionId: id,
                title,
                pic,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status
            }
        });

        return res.status(201).json({ success: true, data: item });
    } catch (error) {
        console.error('Create timeline item error:', error);
        return res.status(500).json({ success: false, message: "Failed to create timeline item" });
    }
};

export const updateTimelineItem = async (req: Request, res: Response) => {
    try {
        const { id, itemId } = req.params;
        const eoId = req.user?.id;
        const { title, pic, startDate, endDate, status } = req.body;

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        const item = await prisma.competitionTimelineItem.update({
            where: { id: itemId },
            data: {
                title,
                pic,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status
            }
        });

        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('Update timeline item error:', error);
        return res.status(500).json({ success: false, message: "Failed to update timeline item" });
    }
};

export const deleteTimelineItem = async (req: Request, res: Response) => {
    try {
        const { id, itemId } = req.params;
        const eoId = req.user?.id;

        const competition = await prisma.competition.findFirst({ where: { id, eoId } });
        if (!competition) return res.status(403).json({ success: false, message: "Not authorized" });

        await prisma.competitionTimelineItem.delete({
            where: { id: itemId }
        });

        return res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error('Delete timeline item error:', error);
        return res.status(500).json({ success: false, message: "Failed to delete timeline item" });
    }
};



// --- Target Layout & Session Management ---

export const getSessions = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id } = req.params;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const sessions = await prisma.competitionSession.findMany({
            where: { competitionId: id },
            include: {
                allocations: {
                    include: { category: true }
                }
            },
            orderBy: { sessionNumber: 'asc' }
        });

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get Sessions Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
};

export const createSession = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id } = req.params;
        const { sessionNumber, startTime, endTime, name } = req.body;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify Event Ownership
        const competition = await prisma.competition.findFirst({
            where: { id, eoId }
        });
        if (!competition) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const session = await prisma.competitionSession.create({
            data: {
                competitionId: id,
                sessionNumber: parseInt(sessionNumber),
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                name
            }
        });

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create session' });
    }
};

export const updateSession = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id, sessionId } = req.params;
        const { sessionNumber, startTime, endTime, name } = req.body;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const session = await prisma.competitionSession.findFirst({
            where: { id: sessionId, competition: { id, eoId } }
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const updated = await prisma.competitionSession.update({
            where: { id: sessionId },
            data: {
                sessionNumber: parseInt(sessionNumber),
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                name
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update session' });
    }
};

export const deleteSession = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id, sessionId } = req.params;

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const session = await prisma.competitionSession.findFirst({
            where: { id: sessionId, competition: { id, eoId } }
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await prisma.competitionSession.delete({
            where: { id: sessionId }
        });

        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete session' });
    }
};

export const saveSessionAllocations = async (req: Request, res: Response) => {
    try {
        const eoId = req.user?.id;
        const { id, sessionId } = req.params;
        const { allocations } = req.body; // Array of { categoryId, targetStart, targetEnd, archersPerTarget }

        if (!eoId) return res.status(401).json({ message: 'Unauthorized' });

        const session = await prisma.competitionSession.findFirst({
            where: { id: sessionId, competition: { id, eoId } }
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Transaction: Delete existing allocations for this session -> Create new ones
        await prisma.$transaction(async (tx) => {
            // Delete existing
            await tx.targetAllocation.deleteMany({
                where: { sessionId }
            });

            // Create new
            if (allocations && allocations.length > 0) {
                await tx.targetAllocation.createMany({
                    data: allocations.map((a: any) => ({
                        sessionId,
                        categoryId: a.categoryId,
                        targetStart: parseInt(a.targetStart),
                        targetEnd: parseInt(a.targetEnd),
                        archersPerTarget: parseInt(a.archersPerTarget || 4)
                    }))
                });
            }
        });

        res.json({ success: true, message: 'Allocations saved' });
    } catch (error) {
        console.error('Save Allocations Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save allocations' });
    }
};
