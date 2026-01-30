import Prisma from '@prisma/client';
import prisma from '../../../lib/prisma.js';
import { Request, Response } from 'express';

/**
 * Search schools in CORE database
 * GET /api/v1/schools/search?q=...&provinceId=...
 */
export const searchSchools = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const provinceId = req.query.provinceId as string;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters',
            });
        }

        const schools = await prisma.school.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: query } },
                            { npsn: { contains: query } },
                            { coreId: { contains: query } },
                        ],
                    },
                    provinceId ? { provinceId } : {},
                ],
            },
            take: limit,
            orderBy: { name: 'asc' },
        });

        return res.json({
            success: true,
            data: schools,
            count: schools.length,
        });
    } catch (error) {
        console.error('Search schools error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search schools',
        });
    }
};

/**
 * Get school by CORE ID
 * GET /api/v1/schools/:coreId
 */
export const getSchoolByCoreId = async (req: Request, res: Response) => {
    try {
        const { coreId } = req.params;

        const school = await prisma.school.findUnique({
            where: { coreId },
            include: {
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
        });

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'School not found',
            });
        }

        return res.json({
            success: true,
            data: school,
        });
    } catch (error) {
        console.error('Get school error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch school',
        });
    }
};

/**
 * Validate Kemendikdasmen URL
 * POST /api/v1/schools/validate-url
 */
export const validateKemendikdasmenUrl = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required',
            });
        }

        // Validate Kemendikdasmen URL format
        const validPattern = /^https:\/\/sekolah\.data\.kemendikdasmen\.go\.id\/sekolah\/.+$/;
        const isValid = validPattern.test(url);

        if (!isValid) {
            return res.json({
                success: true,
                data: {
                    isValid: false,
                    message: 'Invalid URL format. URL must be from sekolah.data.kemendikdasmen.go.id',
                },
            });
        }

        // Extract NPSN from URL if possible
        const npsnMatch = url.match(/\/(\d{8})$/);
        const npsn = npsnMatch ? npsnMatch[1] : null;

        return res.json({
            success: true,
            data: {
                isValid: true,
                url,
                npsn,
                message: 'URL format is valid',
            },
        });
    } catch (error) {
        console.error('Validate URL error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to validate URL',
        });
    }
};

/**
 * Create or update school claim (for students/athletes)
 * POST /api/v1/schools/claim
 */
export const claimSchool = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const { schoolCoreId, nisn, currentClass } = req.body;

        if (!schoolCoreId) {
            return res.status(400).json({
                success: false,
                message: 'School CORE ID is required',
            });
        }

        // Find the school
        const school = await prisma.school.findUnique({
            where: { coreId: schoolCoreId },
        });

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'School not found in CORE database',
            });
        }

        // Create or update student enrollment
        const enrollment = await prisma.studentEnrollment.upsert({
            where: {
                userId_schoolId: {
                    userId,
                    schoolId: school.id,
                },
            },
            update: {
                nisn: nisn || undefined,
                currentClass: currentClass || undefined,
            },
            create: {
                userId,
                schoolId: school.id,
                nisn,
                currentClass,
            },
        });

        // Update user's isStudent flag
        await prisma.user.update({
            where: { id: userId },
            data: { isStudent: true },
        });

        return res.json({
            success: true,
            message: 'School enrollment created successfully',
            data: {
                enrollment,
                school: {
                    id: school.id,
                    coreId: school.coreId,
                    name: school.name,
                },
            },
        });
    } catch (error) {
        console.error('Claim school error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process school claim',
        });
    }
};

/**
 * Get Students for the current School Admin
 * GET /api/v1/schools/students
 */
export const getMyStudents = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // 1. Find which school this user manages
        const school = await prisma.school.findFirst({
            where: { ownerId: userId },
            include: {
                students: {
                    include: {
                        user: {
                            include: {
                                athlete: true
                            }
                        }
                    }
                }
            }
        });

        if (!school) {
            // If not an owner, check if they are generic admin (todo)
            // For now return empty or error
            return res.status(404).json({
                success: false,
                message: 'You are not managing any school.',
            });
        }

        const students = school.students.map(enroll => {
            const athlete = enroll.user.athlete;
            return {
                id: enroll.user.id, // Use User ID or Enrollment ID? Frontend expects Student ID usually
                enrollmentId: enroll.id,
                name: enroll.user.name,
                grade: enroll.currentClass || 'N/A',
                archeryCategory: athlete?.archeryCategory || 'Unassigned',
                skillLevel: athlete?.skillLevel || 'BEGINNER',
                gender: athlete?.gender || 'Unknown',
                avgScore: 0, // TODO: Calculate average score (field avgScoreArrow does not exist on Athlete)
                avatarUrl: enroll.user.avatarUrl
            };
        });

        return res.json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error('Get my students error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
        });
    }
};

/**
 * Get Active O2SN Competitions
 * GET /api/v1/schools/o2sn/current
 */
export const getO2SNCompetitions = async (req: Request, res: Response) => {
    try {
        // Find competitions with "O2SN" in name or tag (simplified)
        // In real world, we'd filter by status=PUBLISHED and date > now
        const competition = await prisma.competition.findFirst({
            where: {
                name: { contains: 'O2SN' },
                status: { in: ['PUBLISHED', 'ONGOING'] }
            },
            take: 1,
            orderBy: { startDate: 'desc' }
        });

        return res.json({
            success: true,
            data: competition
        });
    } catch (error) {
        console.error('Get O2SN error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch O2SN' });
    }
}

/**
 * Register Students to O2SN
 * POST /api/v1/schools/o2sn/register
 */
export const registerStudentToO2SN = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { competitionId, studentIds } = req.body; // studentIds is array of USER IDs

        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ success: false, message: "studentIds array required" });
        }

        // Verify school ownership (security)
        const school = await prisma.school.findFirst({ where: { ownerId: userId } });
        if (!school) {
            return res.status(403).json({ success: false, message: "Not a school admin" });
        }

        // Loop and register
        const results = [];
        for (const studentUserId of studentIds) {
            // Find athlete record
            const athlete = await prisma.athlete.findUnique({ where: { userId: studentUserId } });
            if (!athlete) continue;

            // Register to competition (Assuming CompetitionRegistration model)
            // Need a category. For O2SN, usually category is auto-mapped from Athlete's category.
            // Simplified: Find a matching category in the competition for this athlete
            const compMatches = await prisma.competitionCategory.findMany({
                where: {
                    competitionId,
                    division: athlete.archeryCategory // e.g. RECURVE
                    // Add gender/age check if needed
                }
            });

            if (compMatches.length > 0) {
                const categoryId = compMatches[0].id;
                await prisma.competitionRegistration.create({
                    data: {
                        competitionId,
                        categoryId,
                        athleteId: athlete.id,
                        status: 'PENDING'
                    }
                });
                results.push(studentUserId);
            }
        }

        return res.json({
            success: true,
            message: `Registered ${results.length} students`,
            data: { registered: results }
        });

    } catch (error) {
        console.error('O2SN Register error:', error);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
}

/**
 * Get Registration History
 * GET /api/v1/schools/registrations
 */
export const getMyRegistrations = async (req: Request, res: Response) => {
    // Return history of registrations for this school's students
    return res.json({ success: true, data: [] }); // Placeholder implementation
}
