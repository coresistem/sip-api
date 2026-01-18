import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';


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

/**
 * POST /api/v1/auth/login
 * User login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                club: { select: { id: true, name: true } },
                athlete: { select: { id: true } },
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.',
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
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

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
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
                    sipId: user.sipId,
                    clubId: user.clubId,
                    clubName: user.club?.name,
                    avatarUrl: user.avatarUrl,
                    athleteId: user.athlete?.id,
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
            console.log('Validation errors:', errors.array());
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }

        const { email, password, name, phone, role = 'ATHLETE', clubId } = req.body;

        console.log('[AuthContext] Registering user:', {
            email,
            role,
            provinceId: req.body.provinceId,
            cityId: req.body.cityId,
            whatsapp: req.body.whatsapp
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

        // Generate SIP ID
        const { generateSipId } = await import('../services/sipId.service.js');
        const sipId = await generateSipId(role, req.body.cityId);
        console.log('DEBUG: Generated SIP ID:', sipId);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name,
                phone,
                role: role as string,
                clubId,
                sipId,
                provinceId: req.body.provinceId,
                cityId: req.body.cityId,
                whatsapp: req.body.whatsapp,
            },
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
                    sipId: user.sipId,
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
                import('../services/whatsapp.service.js').then(({ whatsappService }) => {
                    whatsappService.sendWelcomeMessage(
                        targetPhone,
                        user.name,
                        user.role,
                        user.sipId || 'PENDING'
                    ).catch(err => console.error('Failed to send welcome message:', err));
                });
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
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
                sipId: true,
                clubId: true,
                lastLogin: true,
                createdAt: true,
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

        res.json({
            success: true,
            data: user,
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
                sipId: true,
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
 * GET /api/v1/auth/simulate-user/:sipId
 * Get a user profile to simulate a specific user by SIP ID (Super Admin only)
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

        const { sipId } = req.params;

        const user = await prisma.user.findUnique({
            where: { sipId: sipId },
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
                sipId: true,
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
                message: `No user found for SIP ID ${sipId}`,
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
 * Search users by name or SIP ID for View As
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
                    { sipId: { contains: q.toUpperCase() } },
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
                sipId: true,
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
 * GET /api/v1/auth/preview-sip-id
 * Get next available SIP ID for role and city
 */
export const previewSipId = async (req: Request, res: Response): Promise<void> => {
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
        const { generateSipId } = await import('../services/sipId.service.js');
        const sipId = await generateSipId(role, cityId as string);

        res.json({
            success: true,
            data: { sipId },
        });
    } catch (error) {
        console.error('Preview SIP ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate SIP ID preview',
        });
    }
};
