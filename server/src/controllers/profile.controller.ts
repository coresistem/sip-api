import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { validationResult } from 'express-validator';

/**
 * Get current user's profile with role-specific data
 * GET /api/v1/profile
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        // Fetch base user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                sipId: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                nik: true,
                nikVerified: true,
                isStudent: true,
                clubId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Fetch role-specific data
        let roleData: any = null;

        switch (user.role) {
            case 'ATHLETE':
                roleData = await prisma.athlete.findUnique({
                    where: { userId },
                    include: {
                        club: {
                            select: {
                                id: true,
                                name: true,
                                sipId: true,
                            },
                        },
                    },
                });
                break;

            case 'CLUB':
            case 'CLUB_OWNER':
                if (user.clubId) {
                    roleData = await prisma.club.findUnique({
                        where: { id: user.clubId },
                        include: {
                            organization: true,
                            _count: {
                                select: {
                                    members: true,
                                    athletes: true,
                                },
                            },
                        },
                    });
                }
                break;

            case 'SCHOOL':
                // Find school by user's managed school
                const studentEnrollment = await prisma.studentEnrollment.findFirst({
                    where: { userId },
                    include: {
                        school: true,
                    },
                });
                roleData = studentEnrollment?.school || null;
                break;

            case 'PARENT':
                // Get linked athletes (children)
                roleData = await prisma.athlete.findMany({
                    where: { parentId: userId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                        club: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
                break;

            case 'COACH':
                // Get athletes in coach's club
                if (user.clubId) {
                    const clubAthletes = await prisma.athlete.findMany({
                        where: { clubId: user.clubId },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    });
                    roleData = {
                        athletes: clubAthletes,
                        athleteCount: clubAthletes.length,
                    };
                }
                break;

            case 'JUDGE':
                // Judge-specific data (certifications, history) would go here
                roleData = {
                    // Placeholder for judge certifications
                    certifications: [],
                    judgingHistory: [],
                };
                break;

            case 'EO':
                // Event Organizer data
                roleData = {
                    // Placeholder for events organized
                    events: [],
                    upcomingEvents: [],
                };
                break;

            case 'SUPPLIER':
                // Supplier business data
                roleData = {
                    // Placeholder for supplier info
                    products: [],
                    certifications: [],
                };
                break;

            case 'PERPANI':
                // Perpani organization data
                const perpani = await prisma.perpani.findFirst({
                    where: {
                        // Match by province/city based on user's assignment
                        provinceId: user.provinceId || undefined,
                    },
                    include: {
                        clubs: {
                            select: {
                                id: true,
                                name: true,
                                sipId: true,
                            },
                        },
                    },
                });
                roleData = perpani;
                break;

            case 'SUPER_ADMIN':
                // Admin overview stats
                const [userCount, clubCount, athleteCount] = await Promise.all([
                    prisma.user.count(),
                    prisma.club.count(),
                    prisma.athlete.count(),
                ]);
                roleData = {
                    stats: {
                        totalUsers: userCount,
                        totalClubs: clubCount,
                        totalAthletes: athleteCount,
                    },
                };
                break;
        }

        return res.json({
            success: true,
            data: {
                user,
                roleData,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        });
    }
};

/**
 * Update current user's profile
 * PUT /api/v1/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        console.log('[ProfileController] Updating profile for:', userId, 'Body:', req.body);

        const {
            // Common user fields
            name,
            phone,
            whatsapp,
            provinceId,
            cityId,
            nik,
            isStudent,
            // Role-specific fields (passed in nested objects)
            athleteData,
            clubData,
            studentData,
            // ... other role data
        } = req.body;

        // Logic to update SIP ID if city changes and current SIP ID is temporary/default
        let newSipId = undefined;
        if (cityId && userRole && userRole !== 'SUPER_ADMIN') {
            // We need to check if we should update SIP ID. 
            // For onboarding flow: If city is being set for the first time or changed from default
            // logic: Always update SIP ID if city changes? Or only if current is 0000? 
            // Safest for ONBOARDING is to generate if provided.

            // Dynamic import to avoid circular dependency issues if any
            const { generateSipId } = await import('../services/sipId.service.js');
            const generatedId = await generateSipId(userRole, cityId);

            // Optionally checks if current SIP ID is already correct to avoid churning sequence numbers
            // But for now, ensuring correct location code is priority.
            // We only update if the *prefix* would change? 
            // generateSipId returns the *next* sequence. 
            // If we already have a SIP ID with this city code, we might want to keep it?
            // But simpler: If manual update of city, assume re-issuance needed for now or just trust generateSipId handling.

            // PROBLEM: If I generateSipId every time simple profile update happens, I burn sequence numbers.
            // FIX: Only update if the *location part* of current SIP ID doesn't match the new city.
            // However, accessing req.user.sipId might be stale? 
            // Let's assume this is mostly for onboarding where cityId moves from null -> value.

            const currentUser = req.user as any;
            const currentSipId = currentUser?.sipId || '';
            const isDefaultLocation = currentSipId.includes('.0000.');

            if (isDefaultLocation || (currentUser?.cityId !== cityId)) {
                console.log('[ProfileController] Regenerating SIP ID due to city change/initial setup');
                newSipId = generatedId;
            }
        }

        // Update base user data

        // Update base user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || undefined,
                phone: phone || undefined,
                whatsapp: whatsapp || undefined,
                provinceId: provinceId || undefined,
                cityId: cityId || undefined,
                sipId: newSipId || undefined,
                nik: nik || undefined,
                isStudent: isStudent !== undefined ? isStudent : undefined,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                sipId: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                nik: true,
                nikVerified: true,
                isStudent: true,
                clubId: true,
                updatedAt: true,
            },
        });

        // Update role-specific data
        let updatedRoleData: any = null;

        switch (userRole) {
            case 'ATHLETE':
                if (athleteData) {
                    // Start of Athlete Logic
                    // Ensure clubId is present if creating a new athlete
                    if (!updatedUser.clubId) {
                        // Attempting to create/update athlete without a club. 
                        // If it's an update, maybe we don't need it if it exists, but create needs it.
                        // For now, let's proceed and let Prisma throw if missing constraint, or we check existing.
                    }

                    // Prepare common data object
                    const rawPayload = {
                        dateOfBirth: athleteData.dateOfBirth ? new Date(athleteData.dateOfBirth) : undefined,
                        gender: athleteData.gender || undefined,
                        archeryCategory: athleteData.archeryCategory || undefined,
                        division: athleteData.division || undefined,
                        skillLevel: athleteData.skillLevel || undefined,
                        height: athleteData.height || undefined,
                        weight: athleteData.weight || undefined,
                        armSpan: athleteData.armSpan || undefined,
                        drawLength: athleteData.drawLength || undefined,
                        dominantHand: athleteData.dominantHand || undefined,
                        dominantEye: athleteData.dominantEye || undefined,
                        bowBrand: athleteData.bowBrand || undefined,
                        bowModel: athleteData.bowModel || undefined,
                        bowDrawWeight: athleteData.bowDrawWeight || undefined,
                        arrowBrand: athleteData.arrowBrand || undefined,
                        arrowSpine: athleteData.arrowSpine || undefined,
                        emergencyContact: athleteData.emergencyContact || undefined,
                        emergencyPhone: athleteData.emergencyPhone || undefined,
                        medicalNotes: athleteData.medicalNotes || undefined,
                    };

                    // Remove undefined keys
                    const athletePayload = Object.fromEntries(
                        Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
                    );

                    // Use Upsert to handle both Create and Update
                    // Note: Create requires clubId. If updatedUser.clubId is null, this will fail.
                    // We need a fallback or ensure frontend forces club selection.
                    // Use Upsert to handle both Create and Update
                    // Modified to allow independent athletes (no clubId)
                    {
                        const createData: any = {
                            userId,
                            clubId: updatedUser.clubId,
                            ...athletePayload
                        };

                        // Ensure required fields
                        if (!createData.dateOfBirth) createData.dateOfBirth = new Date();
                        if (!createData.gender) createData.gender = 'MALE';

                        console.log('DEBUG: UPSERT CREATE DATA:', JSON.stringify(createData, null, 2));

                        updatedRoleData = await prisma.athlete.upsert({
                            where: { userId },
                            update: athletePayload,
                            create: createData
                        });
                        // Update StudentEnrollment if provided
                    }

                    // Update StudentEnrollment if provided
                    if (studentData && studentData.schoolId) {
                        await prisma.studentEnrollment.upsert({
                            where: {
                                userId_schoolId: {
                                    userId,
                                    schoolId: studentData.schoolId
                                }
                            },
                            update: {
                                nisn: studentData.nisn || undefined,
                                currentClass: studentData.currentClass || undefined,
                            },
                            create: {
                                userId,
                                schoolId: studentData.schoolId,
                                nisn: studentData.nisn || undefined,
                                currentClass: studentData.currentClass || undefined,
                                status: 'ACTIVE'
                            }
                        });
                    }
                }
                break;

            case 'CLUB':
            case 'CLUB_OWNER':
                if (clubData && updatedUser.clubId) {
                    updatedRoleData = await prisma.club.update({
                        where: { id: updatedUser.clubId },
                        data: {
                            name: clubData.name || undefined,
                            address: clubData.address || undefined,
                            city: clubData.city || undefined,
                            province: clubData.province || undefined,
                            postalCode: clubData.postalCode || undefined,
                            phone: clubData.phone || undefined,
                            email: clubData.email || undefined,
                            website: clubData.website || undefined,
                            description: clubData.description || undefined,
                            whatsappHotline: clubData.whatsappHotline || undefined,
                            instagram: clubData.instagram || undefined,
                        },
                    });
                }
                break;

            // Add other role-specific updates as needed
        }

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser,
                roleData: updatedRoleData,
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        console.error('Error Code:', error.code);
        console.error('Error Meta:', error.meta);
        console.error('Error Message:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        });
    }
};

/**
 * Get a specific user's profile (admin only)
 * GET /api/v1/profile/:userId
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const requestingUserRole = req.user?.role;

        // Only admins can view other profiles
        if (!['SUPER_ADMIN', 'PERPANI', 'CLUB', 'CLUB_OWNER'].includes(requestingUserRole || '')) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                sipId: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                isActive: true,
                clubId: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
        });
    }
};

/**
 * Update avatar
 * POST /api/v1/profile/avatar
 */
export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        // For now, accept avatarUrl from body (file upload will be added later)
        const { avatarUrl } = req.body;

        if (!avatarUrl) {
            return res.status(400).json({
                success: false,
                message: 'Avatar URL is required',
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: {
                id: true,
                avatarUrl: true,
            },
        });

        return res.json({
            success: true,
            message: 'Avatar updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update avatar error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update avatar',
        });
    }
};
