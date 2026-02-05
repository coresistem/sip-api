import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Role type as string since we're using SQLite
export type Role = 'SUPER_ADMIN' | 'PERPANI' | 'CLUB' | 'SCHOOL' | 'ATHLETE' | 'PARENT' | 'COACH' | 'JUDGE' | 'EO' | 'SUPPLIER' | 'MANPOWER';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
                clubId: string | null;
                name: string;
                cityId: string | null;
                coreId: string | null;
            };
        }
    }
}

interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
    clubId: string | null;
    iat?: number;
    exp?: number;
}

// AuthRequest extends Express Request with optional user property
// We use generics with 'any' defaults to ensure compatibility with existing code
// while allowing body, query, and params to be accessible.
export interface AuthRequest<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: {
        id: string;
        email: string;
        role: Role;
        clubId: string | null;
        name: string;
        cityId: string | null;
        coreId: string | null;
    };
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, secret) as JWTPayload;

        // Fetch user from database to ensure they still exist and are active
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                clubId: true,
                activeRole: true,
                isActive: true,
                cityId: true,
                coreId: true,
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
            return;
        }

        // Attach user to request - activeRole takes precedence for multi-role users
        const effectiveRole = (user.activeRole || user.role) as Role;

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: effectiveRole,
            clubId: user.clubId,
            cityId: user.cityId,
            coreId: user.coreId,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};

/**
 * Optional authentication - attaches user if token is present, but doesn't require it
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return next();
        }

        const decoded = jwt.verify(token, secret) as JWTPayload;
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                clubId: true,
                activeRole: true,
                isActive: true,
                cityId: true,
                coreId: true,
            },
        });

        if (user && user.isActive) {
            const effectiveRole = (user.activeRole || user.role) as Role;
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: effectiveRole,
                clubId: user.clubId,
                cityId: user.cityId,
                coreId: user.coreId,
            };
        }

        next();
    } catch {
        // Silently ignore errors for optional auth
        next();
    }
};

/**
 * Role-based authorization middleware
 * Must be used AFTER authenticate middleware
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: allowedRoles,
                userRole: req.user.role,
            });
            return;
        }

        next();
    };
};
