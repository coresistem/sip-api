import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../../lib/prisma.js';
import { authService } from '../application/auth.service.js';
import { AuthRequest } from '../../../middleware/auth.middleware.js';
import fs from 'fs';



const safeJsonParse = (jsonString: any, fallback: any = []) => {
    if (!jsonString) return fallback;
    try {
        const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        return parsed || fallback;
    } catch (e) {
        console.error('JSON parse error:', e);
        return fallback;
    }
};

const normalizePhoneNumber = (value?: string | null): string | null => {
    if (!value) return null;

    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) return null;

    if (digitsOnly.startsWith('62')) return digitsOnly;
    if (digitsOnly.startsWith('0')) return `62${digitsOnly.slice(1)}`;
    if (digitsOnly.startsWith('8')) return `62${digitsOnly}`;

    return digitsOnly;
};

interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    clubId: string | null;
}

/**
 * Generate access and refresh tokens
 */
const generateTokens = (payload: JWTPayload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(
        { userId: payload.userId, jti: crypto.randomUUID() },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
};

const logToFile = (msg: string) => {
    // Hardcoded absolute path for debugging certainty
    const logPath = 'd:\\Antigravity\\sip\\server\\server-debug.log';
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
};

/**
 * POST /api/v1/auth/login
 * User login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        logToFile(`Login attempt for email: ${req.body.email}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logToFile(`Login validation errors: ${JSON.stringify(errors.array())}`);
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        // Find user via Hexagonal Service
        const user = await authService.validateUser(email);

        if (!user) {
            logToFile(`Login failed: User not found for email: ${email}`);
            console.log(`[DEBUG] Login failed: User not found for email: [${email}]`);
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        logToFile(`User found: ${user.email}, isActive: ${user.isActive}`);
        console.log(`[DEBUG] User found: ${user.email}, isActive: ${user.isActive}`);

        // Check if user is active
        if (!user.isActive) {
            logToFile(`Login failed: User ${user.email} is not active`);
            console.log(`[DEBUG] Login failed: User ${user.email} is not active`);
            res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.',
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            logToFile(`Login failed [WRONG_PASSWORD]: ${user.email}`);
            console.log(`[DEBUG] Login failed [WRONG_PASSWORD]: ${user.email}`);
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Generate tokens
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            clubId: user.clubId,
        };
        const { accessToken, refreshToken } = generateTokens(payload);

        // Calculate refresh token expiry
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const expiresInMs = parseInt(refreshExpiresIn) * 24 * 60 * 60 * 1000; // Assuming days
        const expiresAt = new Date(Date.now() + expiresInMs);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        // Update last login via Hexagonal Service
        await authService.updateLoginHistory(user.id);

        // Log login event for analytics
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                entity: 'USER',
                entityId: user.id,
                ipAddress: req.ip || 'Unknown',
                userAgent: req.headers['user-agent'] || 'Unknown',
            },
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    coreId: user.coreId,
                    clubId: user.clubId,
                    clubName: user.club?.name,
                    avatarUrl: user.avatarUrl,
                    athleteId: user.athlete?.id,
                    // Multi-role fields
                    roles: user.roles, // JSON string
                    activeRole: user.activeRole,
                    coreIds: user.coreIds, // JSON string
                    roleStatuses: user.roleStatuses, // JSON string
                    manpowerShortcuts: safeJsonParse(user.manpower?.shortcuts, []),
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
        });
    }
};

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('[DIAGNOSTIC] Validation failed:', JSON.stringify(errors.array(), null, 2));
            res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: errors.array()
            });
            return;
        }

        const {
            email, password, name, phone, role = 'ATHLETE', clubId, childId, refAthleteId,
            whatsapp, provinceId, cityId, isStudent, gender, dateOfBirth
        } = req.body;

        console.log('[DIAGNOSTIC] Register Request:', {
            email,
            role,
            cityId,
            childId,
            refAthleteId,
            hasWhatsapp: !!whatsapp,
            hasPhone: !!phone
        });

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate CoreID
        const { generateCoreId } = await import('./coreId.service.js');
        const coreId = await generateCoreId(role, req.body.cityId);
        console.log('DEBUG: Generated CoreID:', coreId);

        // Create user and link child in a transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    name,
                    phone,
                    role: role as string,
                    clubId,
                    coreId,
                    provinceId: provinceId || undefined,
                    cityId: cityId || undefined,
                    whatsapp: whatsapp || undefined,
                    isStudent: isStudent === true,
                    gender: gender || undefined,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                },
            });

            // IF role is ATHLETE, we MUST create the Athlete profile record
            if (role === 'ATHLETE') {
                console.log(`[Auth] Creating Athlete profile for ${newUser.id}`);
                await tx.athlete.create({
                    data: {
                        userId: newUser.id,
                        clubId: clubId || undefined, // Link to club if provided during registration
                    }
                });
            }

            const linkTargetUserId = childId || refAthleteId;
            if (linkTargetUserId) {
                console.log(`[Auth] Linking Parent ${newUser.id} to Child Athlete (Searching by userId: ${linkTargetUserId})`);
                // Use updateMany because searching by userId which might not have an athlete record yet. 
                // This prevents the entire registration from failing if the child record isn't found.
                const updateStatus = await tx.athlete.updateMany({
                    where: { userId: linkTargetUserId },
                    data: { parentId: newUser.id }
                });
                console.log(`[Auth] Link success: ${updateStatus.count} child record(s) linked by UUID.`);
            }

            // AUTO-DISCOVERY: If role is PARENT, search for Athletes by WhatsApp (emergencyPhone)
            if (role === 'PARENT' && (whatsapp || phone)) {
                const rawPhone = whatsapp || phone;
                const normalizedPhone = normalizePhoneNumber(rawPhone);

                if (normalizedPhone) {
                    const last6 = normalizedPhone.length >= 6 ? normalizedPhone.slice(-6) : normalizedPhone;
                    console.log(`[Auth] Discovery: Searching for Athletes with emergencyPhone matching: ${normalizedPhone} (Raw: ${rawPhone})`);

                    const candidates = await tx.athlete.findMany({
                        where: {
                            parentId: null,
                            emergencyPhone: last6
                                ? { not: null, contains: last6 }
                                : { not: null }
                        },
                        select: {
                            id: true,
                            emergencyPhone: true,
                        }
                    });

                    const matchedAthleteIds = candidates
                        .filter(a => normalizePhoneNumber(a.emergencyPhone) === normalizedPhone)
                        .map(a => a.id);

                    if (matchedAthleteIds.length > 0) {
                        const discoveryStatus = await tx.athlete.updateMany({
                            where: {
                                id: { in: matchedAthleteIds },
                                parentId: null,
                            },
                            data: { parentId: newUser.id }
                        });

                        if (discoveryStatus.count > 0) {
                            console.log(`[Auth] Success: Auto-linked ${discoveryStatus.count} child record(s) by WhatsApp.`);
                        }
                    }
                }
            }

            return newUser;
        });

        // Generate tokens
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            clubId: user.clubId,
        };
        const { accessToken, refreshToken } = generateTokens(payload);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    coreId: user.coreId,
                    provinceId: user.provinceId,
                    cityId: user.cityId,
                    whatsapp: user.whatsapp,
                },
                accessToken,
                refreshToken,
            },
        });

        // Send Welcome Message (Async - Fire and Forget)
        if (user.phone || user.whatsapp) { // Assuming phone might be used as whatsapp or we add whatsapp field support in register
            // Note: Currently register only takes phone, but we might want to ensure we capture whatsapp
            const targetPhone = user.whatsapp || user.phone;
            if (targetPhone) {
                // Format phone if needed, but service takes string
                import('./whatsapp.service.js').then(({ whatsappService }) => {
                    whatsappService.sendWelcomeMessage(
                        targetPhone,
                        user.name,
                        user.role,
                        user.coreId || 'PENDING'
                    ).catch(err => console.error('Failed to send welcome message:', err));
                });
            }
        }
    } catch (error: any) {
        console.error('CRITICAL Registration failure:', error);
        res.status(500).json({
            success: false,
            message: `Registration failed: ${error.message || 'Internal Server Error'}`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * POST /api/v1/auth/self-register
 * Beta Self-Registration for Athletes
 */
export const selfRegister = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }

        const { email, password, name, phone, clubId } = req.body;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
            return;
        }

        // 1. Generate Beta CoreID: 04.9999.{Random4Digits}
        // Constraint: Use '9999' as fixed region code
        // We'll use a loop to ensure uniqueness just in case
        let coreId = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
            coreId = `04.9999.${randomDigits}`;

            const collision = await prisma.user.findUnique({
                where: { coreId }
            });

            if (!collision) {
                isUnique = true;
            }
            attempts++;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 2. Wrap in transaction: Create User and ClubJoinRequest
        const result = await prisma.$transaction(async (tx) => {
            // Create User record
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    name,
                    phone,
                    role: 'ATHLETE',
                    coreId, // This is our Beta ID
                    isActive: true,
                },
            });

            // Create ClubJoinRequest record
            if (clubId) {
                await tx.clubJoinRequest.create({
                    data: {
                        userId: user.id,
                        clubId: clubId,
                        role: 'ATHLETE',
                        status: 'PENDING',
                        notes: 'Self-registered via Beta Registration',
                    },
                });
            }

            return user;
        });

        res.status(201).json({
            success: true,
            message: `Registration successful! Your Beta ID: ${coreId}`,
            data: {
                user: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    role: result.role,
                    coreId: result.coreId,
                }
            },
        });
    } catch (error: any) {
        console.error('Self-registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};

/**
 * GET /api/v1/auth/clubs
 * Public list of clubs for registration dropdown
 */
export const getClubs = async (req: Request, res: Response): Promise<void> => {
    try {
        const clubs = await prisma.club.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                city: true,
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: clubs,
        });
    } catch (error) {
        console.error('Get clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clubs',
        });
    }
};


/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        } catch {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }

        // Check if token exists in database
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                token,
                userId: decoded.userId,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });

        if (!storedToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token expired or invalid',
            });
            return;
        }

        // Generate new access token
        const payload: JWTPayload = {
            userId: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role,
            clubId: storedToken.user.clubId,
        };
        const { accessToken } = generateTokens(payload);

        res.json({
            success: true,
            data: { accessToken },
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed',
        });
    }
};

/**
 * POST /api/v1/auth/logout
 * Logout user and invalidate refresh token
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Delete specific refresh token
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        } else if (req.user) {
            // Delete all user's refresh tokens
            await prisma.refreshToken.deleteMany({
                where: { userId: req.user.id },
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
        });
    }
};

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                avatarUrl: true,
                role: true,
                coreId: true,
                clubId: true,
                lastLogin: true,
                createdAt: true,
                activeRole: true,
                roles: true,
                coreIds: true,
                roleStatuses: true,
                club: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
                athlete: {
                    select: {
                        id: true,
                        archeryCategory: true,
                        skillLevel: true,
                        division: true,
                        height: true,
                        weight: true,
                        bowBrand: true,
                        arrowBrand: true,
                    },
                },
                manpower: {
                    select: {
                        shortcuts: true,
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Parse JSON fields if they are strings
        const formattedUser = {
            ...user,
            roles: typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles,
            coreIds: typeof user.coreIds === 'string' ? JSON.parse(user.coreIds) : user.coreIds,
            roleStatuses: typeof user.roleStatuses === 'string' ? JSON.parse(user.roleStatuses) : user.roleStatuses,
            manpowerShortcuts: safeJsonParse(user.manpower?.shortcuts, []),
        };

        res.json({
            success: true,
            data: formattedUser,
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
        });
    }
};

/**
 * PATCH /api/v1/auth/password
 * Change user password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current and new password required',
            });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters',
            });
            return;
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }

        // Hash and update new password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash },
        });

        // Invalidate all refresh tokens
        await prisma.refreshToken.deleteMany({
            where: { userId: req.user.id },
        });

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
        });
    }
};

/**
 * GET /api/v1/auth/simulate/:role
 * Get a user profile to simulate a specific role (Super Admin only)
 */
export const simulateRole = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Access denied',
            });
            return;
        }

        const { role } = req.params;

        // Find the first user with this role
        const user = await prisma.user.findFirst({
            where: { role: role },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                avatarUrl: true,
                role: true,
                clubId: true,
                lastLogin: true,
                createdAt: true,
                coreId: true,
                club: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
                athlete: {
                    select: {
                        id: true,
                        archeryCategory: true,
                        skillLevel: true,
                        division: true,
                        height: true,
                        weight: true,
                        bowBrand: true,
                        arrowBrand: true,
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: `No user found for role ${role}`,
            });
            return;
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Simulate role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to simulate role',
        });
    }
};

/**
 * GET /api/v1/auth/simulate-user/:coreId
 * Get a user profile to simulate a specific user by CORE ID (Super Admin only)
 */
export const simulateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Access denied',
            });
            return;
        }

        const { coreId } = req.params;

        const user = await prisma.user.findUnique({
            where: { coreId: coreId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                whatsapp: true,
                provinceId: true,
                cityId: true,
                avatarUrl: true,
                role: true,
                clubId: true,
                lastLogin: true,
                createdAt: true,
                coreId: true,
                club: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
                athlete: {
                    select: {
                        id: true,
                        archeryCategory: true,
                        skillLevel: true,
                        division: true,
                        height: true,
                        weight: true,
                        bowBrand: true,
                        arrowBrand: true,
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: `No user found for CoreID ${coreId}`,
            });
            return;
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Simulate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to simulate user',
        });
    }
};

/**
 * GET /api/v1/auth/search-users
 * Search users by name or CORE ID for View As
 */
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            res.status(400).json({
                success: false,
                message: 'Query must be at least 2 characters',
            });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: q } }, // SQLite is case-insensitive by default for ASCII
                    { coreId: { contains: q.toUpperCase() } },
                ],
                isActive: true, // Only show active users
                NOT: {
                    role: 'SUPER_ADMIN', // Don't show super admins
                }
            },
            take: 10,
            select: {
                id: true,
                name: true,
                coreId: true,
                role: true,
                avatarUrl: true,
                club: {
                    select: {
                        name: true,
                    }
                }
            },
        });

        res.json({
            success: true,
            data: users || [],
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users',
        });
    }
};

/**
 * GET /api/v1/auth/preview-core-id
 * Get next available CoreID for role and city
 */
export const previewCoreId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, cityId } = req.query;

        if (!role || typeof role !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Role is required',
            });
            return;
        }

        // Import dynamically to avoid circular deps if any
        const { generateCoreId } = await import('./coreId.service.js');
        const coreId = await generateCoreId(role, cityId as string);

        res.json({
            success: true,
            data: { coreId },
        });
    } catch (error) {
        console.error('Preview CoreID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate CORE ID preview',
        });
    }
};

/**
 * GET /api/v1/auth/check-email
 * Check if email exists and return current roles (for multi-role request flow)
 */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                name: true,
                role: true,
                roles: true,
            }
        });

        if (!user) {
            res.json({
                success: true,
                data: { exists: false }
            });
            return;
        }

        // Parse roles (support both single role and multi-role)
        const currentRoles = user.roles
            ? JSON.parse(user.roles)
            : [user.role];

        res.json({
            success: true,
            data: {
                exists: true,
                name: user.name,
                currentRoles
            }
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check email',
        });
    }
};

/**
 * PATCH /api/v1/auth/switch-role
 * Switch active role for multi-role users
 */
export const switchRole = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }

        const { role } = req.body;

        if (!role) {
            res.status(400).json({
                success: false,
                message: 'Role is required',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Check if user has this role
        const userRoles = user.roles ? JSON.parse(user.roles) : [user.role];
        if (!userRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'You do not have this role',
            });
            return;
        }

        // Update active role and for compatibility, the main role field too if needed
        // But for now we just track activeRole. 
        // NOTE: Does 'role' field need to change? The schema says `role` is String (singular). 
        // If we want `req.user.role` to match in future sessions, we might need to update it or rely solely on activeRole.
        // For safety, let's keep database `role` as the "primary/default" role, and `activeRole` as current context.
        // BUT the Token MUST have the new role.

        await prisma.user.update({
            where: { id: req.user.id },
            data: { activeRole: role }
        });

        // Generate NEW tokens with the target role
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: role, // <--- IMPORTANT: Token role is now the target role
            clubId: user.clubId,
        };

        const { accessToken, refreshToken } = generateTokens(payload);

        // Store new refresh token
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const expiresInMs = parseInt(refreshExpiresIn) * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiresInMs);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        res.json({
            success: true,
            message: 'Role switched successfully',
            data: {
                activeRole: role,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Switch role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to switch role',
        });
    }
};
