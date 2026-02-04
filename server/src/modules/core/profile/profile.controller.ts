import { Request, Response } from 'express';
import { AuthRequest } from '../../../middleware/auth.middleware.js';
import prisma from '../../../lib/prisma.js';
import { validationResult } from 'express-validator';
import { notificationService } from '../notification/notification.service.js';

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
                coreId: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                nik: true,
                nikVerified: true,
                isStudent: true,
                dateOfBirth: true,
                gender: true,
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
                                coreId: true,
                            },
                        },
                    },
                });
                break;

            case 'CLUB':
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
                                coreId: true,
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
    } catch (error: any) {
        console.error('[ProfileController] Get profile error:', error);
        console.error('[ProfileController] Error Code:', error.code);
        console.error('[ProfileController] Error Message:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getClubStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                clubId: true,
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const [pendingRequest, latestApprovedRequest, latestLeftAudit] = await Promise.all([
            prisma.clubJoinRequest.findFirst({
                where: {
                    userId,
                    status: 'PENDING'
                },
                include: {
                    club: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            logoUrl: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.clubJoinRequest.findFirst({
                where: {
                    userId,
                    status: 'APPROVED'
                },
                include: {
                    club: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            logoUrl: true,
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.auditLog.findFirst({
                where: {
                    userId,
                    action: 'MEMBER_LEFT'
                },
                select: {
                    entityId: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        if (user.clubId) {
            const club = await prisma.club.findUnique({
                where: { id: user.clubId },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    logoUrl: true,
                }
            });

            return res.json({
                success: true,
                data: {
                    status: 'MEMBER',
                    club,
                    pendingRequest: null,
                    leftAt: null,
                    lastClub: null,
                }
            });
        }

        if (pendingRequest) {
            return res.json({
                success: true,
                data: {
                    status: 'PENDING',
                    club: null,
                    pendingRequest: {
                        id: pendingRequest.id,
                        club: pendingRequest.club,
                        createdAt: pendingRequest.createdAt,
                        updatedAt: pendingRequest.updatedAt,
                    },
                    leftAt: null,
                    lastClub: null,
                }
            });
        }

        const hasLeftSignal = !!latestLeftAudit || !!latestApprovedRequest;
        if (hasLeftSignal) {
            return res.json({
                success: true,
                data: {
                    status: 'LEFT',
                    club: null,
                    pendingRequest: null,
                    leftAt: latestLeftAudit?.createdAt || null,
                    lastClub: latestApprovedRequest?.club || null,
                }
            });
        }

        return res.json({
            success: true,
            data: {
                status: 'NO_CLUB',
                club: null,
                pendingRequest: null,
                leftAt: null,
                lastClub: null,
            }
        });

    } catch (error) {
        console.error('Get club status error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get club status' });
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
            occupation, // Added occupation
            dateOfBirth,
            gender,
            // Role-specific fields (passed in nested objects)
            athleteData,
            clubData,
            studentData,
            // ... other role data
        } = req.body;

        // Logic to update CoreID if city changes and current CoreID is temporary/default
        let newCoreId = undefined;
        if (cityId && userRole && userRole !== 'SUPER_ADMIN') {
            // We need to check if we should update CORE ID.
            // For onboarding flow: If city is being set for the first time or changed from default
            // logic: Always update CORE ID if city changes? Or only if current is 0000?
            // Safest for ONBOARDING is to generate if provided.

            // Dynamic import to avoid circular dependency issues if any
            const { generateCoreId } = await import('../auth/coreId.service.js');
            const generatedId = await generateCoreId(userRole, cityId);

            // Optionally checks if current CoreID is already correct to avoid churning sequence numbers
            // But for now, ensuring correct location code is priority.
            // We only update if the *prefix* would change? 
            // generateCoreId returns the *next* sequence. 
            // If we already have a CoreID with this city code, we might want to keep it?
            // But simpler: If manual update of city, assume re-issuance needed for now or just trust generateCoreId handling.

            // PROBLEM: If I generateCoreId every time simple profile update happens, I burn sequence numbers.
            // FIX: Only update if the *location part* of current CoreID doesn't match the new city.
            // However, accessing req.user.coreId might be stale? 
            // Let's assume this is mostly for onboarding where cityId moves from null -> value.

            const currentUser = req.user as any;
            const currentCoreId = currentUser?.coreId || '';
            const isDefaultLocation = currentCoreId.includes('.0000.');

            if (isDefaultLocation || (currentUser?.cityId !== cityId)) {
                console.log('[ProfileController] Regenerating CoreID due to city change/initial setup');
                newCoreId = generatedId;
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
                coreId: newCoreId || undefined,
                nik: nik || undefined,
                isStudent: isStudent !== undefined ? isStudent : undefined,
                occupation: occupation || undefined,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender: gender || undefined,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                coreId: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                nik: true,
                nikVerified: true,
                isStudent: true,
                dateOfBirth: true,
                gender: true,
                clubId: true,
                createdAt: true,
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
        if (!['SUPER_ADMIN', 'PERPANI', 'CLUB'].includes(requestingUserRole || '')) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
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

/**
 * POST /api/v1/profile/join-club
 * Request to join a club
 */
export const requestClubJoin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { clubId } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (!clubId) return res.status(400).json({ success: false, message: 'Club ID is required' });

        // Check if user is already a member of a club
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, clubId: true, role: true, name: true }
        });

        if (user?.clubId) {
            // Already in a club. For now, reject. Future: handle transfer.
            // But if user.clubId matches request, maybe just return success (idempotent)?
            if (user.clubId === clubId) {
                return res.json({ success: true, message: 'Already a member of this club' });
            }
            return res.status(400).json({ success: false, message: 'You are already a member of another club. Please leave it first.' });
        }

        // Check for existing pending request
        const existingRequest = await prisma.clubJoinRequest.findFirst({
            where: {
                userId,
                status: 'PENDING'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'You already have a pending join request' });
        }

        // Create Request
        const joinRequest = await prisma.clubJoinRequest.create({
            data: {
                userId,
                clubId,
                role: user?.role || 'ATHLETE',
                status: 'PENDING',
                notes: 'Requested via Profile Page'
            }
        });

        // 3. Notify the Club Owner
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: { name: true, ownerId: true }
        });

        if (club?.ownerId) {
            await notificationService.notifyIntegrationRequest(
                club.ownerId,
                user?.name || 'An athlete',
                club.name,
                joinRequest.id
            );
        }

        return res.json({
            success: true,
            message: 'Join request sent successfully',
        });

    } catch (error) {
        console.error('Join club request error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send join request',
        });
    }
};

/**
 * POST /api/v1/profile/leave-club
 * Athlete voluntarily leaves their current club
 */
export const leaveClub = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { reason } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get user's current club
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, clubId: true, name: true }
        });

        if (!user?.clubId) {
            return res.status(400).json({ success: false, message: 'You are not currently a member of any club' });
        }

        // Get athlete record
        const athlete = await prisma.athlete.findUnique({
            where: { userId }
        });

        // Get club name for audit
        const club = await prisma.club.findUnique({
            where: { id: user.clubId },
            select: { name: true, ownerId: true }
        });

        // Transaction: Update athlete, user, and create audit log
        await prisma.$transaction([
            // Remove athlete's club association
            ...(athlete ? [
                prisma.athlete.update({
                    where: { id: athlete.id },
                    data: { clubId: null }
                })
            ] : []),
            // Remove user's club association  
            prisma.user.update({
                where: { id: userId },
                data: { clubId: null }
            }),
            // Create audit log
            prisma.auditLog.create({
                data: {
                    userId,
                    action: 'MEMBER_LEFT',
                    entity: 'Club',
                    entityId: user.clubId,
                    oldValues: JSON.stringify({ clubId: user.clubId, clubName: club?.name }),
                    newValues: JSON.stringify({ clubId: null }),
                    metadata: JSON.stringify({
                        leaveReason: reason || 'Voluntary resignation',
                        memberName: user.name
                    })
                }
            })
        ]);

        // Notify the club owner
        if (club?.ownerId) {
            await notificationService.notifyIntegrationDecision(
                club.ownerId,
                user.name || 'A member',
                'LEFT',
                reason || 'Member has left the club voluntarily'
            );
        }

        return res.json({
            success: true,
            message: 'Successfully left the club',
        });

    } catch (error) {
        console.error('Leave club error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to leave club',
        });
    }
};

/**
 * Save user consent (Explicit Consent Tracking)
 * POST /api/v1/profile/consent
 */
export const saveConsent = async (req: AuthRequest, res: Response) => {
    try {
        const { consentType, isAccepted, version } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!consentType) {
            return res.status(400).json({ success: false, message: 'Consent type is required' });
        }

        const consent = await (prisma as any).userConsent.create({
            data: {
                userId,
                consentType,
                isAccepted: !!isAccepted,
                version: version || '1.0',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        return res.json({
            success: true,
            data: consent
        });
    } catch (error) {
        console.error('Error saving consent:', error);
        return res.status(500).json({ success: false, message: 'Failed to save consent' });
    }
};
/**
 * Get user consents history
 * GET /api/v1/profile/consents
 */
export const getConsents = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const consents = await (prisma as any).userConsent.findMany({
            where: { userId },
            orderBy: { acceptedAt: 'desc' }
        });

        return res.json({
            success: true,
            data: consents
        });
    } catch (error) {
        console.error('Error fetching consents:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch consents' });
    }
};

/**
 * GET /api/v1/profile/club-history
 * Get user's club membership history
 */
export const getClubHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const history = await prisma.clubJoinRequest.findMany({
            where: {
                userId,
                status: 'APPROVED'
            },
            include: {
                club: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        logoUrl: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return res.json({
            success: true,
            data: history.map(h => ({
                clubId: h.clubId,
                clubName: h.club.name,
                city: h.club.city,
                joinDate: h.updatedAt, // Approval time is the join time
                status: 'ACTIVE' // Determine if still active based on current clubId? For now just log.
            }))
        });
    } catch (error) {
        console.error('Get club history error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get club history' });
    }
};

/**
 * POST /api/v1/profile/link-child
 * Link a parent account to a child athlete account using CoreID
 */
export const linkChild = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id; // Parent ID
        const { childCoreId } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (!childCoreId) return res.status(400).json({ success: false, message: 'Child Core ID is required' });

        // Verify requestor is a PARENT
        if (req.user?.role !== 'PARENT') {
            return res.status(403).json({ success: false, message: 'Only PARENT role can link children' });
        }

        // Find child user
        const childUser = await prisma.user.findFirst({
            where: { coreId: childCoreId }
        });

        if (!childUser) {
            return res.status(404).json({ success: false, message: 'Child account not found locally. Please ensure child has registered.' });
        }

        // Find child athlete record
        const childAthlete = await prisma.athlete.findUnique({
            where: { userId: childUser.id }
        });

        if (!childAthlete) {
            return res.status(404).json({ success: false, message: 'Athlete profile for child not found' });
        }

        // Link parent to child
        await prisma.athlete.update({
            where: { id: childAthlete.id },
            data: {
                parentId: userId
            }
        });

        // Optionally update emergency contact info on child if empty
        if (!childAthlete.emergencyContact || !childAthlete.emergencyPhone) {
            const parentDetails = await prisma.user.findUnique({
                where: { id: req.user!.id },
                select: { name: true, phone: true }
            });

            if (parentDetails) {
                await prisma.athlete.update({
                    where: { id: childAthlete.id },
                    data: {
                        emergencyContact: childAthlete.emergencyContact || parentDetails.name,
                        emergencyPhone: childAthlete.emergencyPhone || parentDetails.phone || undefined
                    }
                });
            }
        }

        return res.json({
            success: true,
            message: `Successfully linked to child: ${childUser.name} (${childCoreId})`,
            data: {
                childName: childUser.name,
                childCoreId: childUser.coreId
            }
        });

    } catch (error) {
        console.error('Link child error:', error);
        return res.status(500).json({ success: false, message: 'Failed to link child account' });
    }
};
