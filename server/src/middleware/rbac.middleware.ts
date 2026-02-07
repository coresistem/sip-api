import { Request, Response, NextFunction } from 'express';

// Role type as string since we're using SQLite
export type Role = 'SUPER_ADMIN' | 'PERPANI' | 'LEGAL' | 'CLUB' | 'SCHOOL' | 'ATHLETE' | 'PARENT' | 'COACH' | 'JUDGE' | 'EO' | 'SUPPLIER' | 'MANPOWER';

/**
 * Role hierarchy for permission checking
 * Higher numbers = more permissions
 */
const ROLE_HIERARCHY: Record<Role, number> = {
    SUPER_ADMIN: 100,
    PERPANI: 90,
    LEGAL: 85,
    CLUB: 80,
    COACH: 60,
    EO: 60,
    JUDGE: 60,
    SUPPLIER: 50,
    MANPOWER: 50,
    SCHOOL: 40,
    ATHLETE: 30,
    PARENT: 20,
};

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    SUPER_ADMIN: [
        'manage:all',
        'view:all',
        'manage:clubs',
        'manage:users',
        'view:audit_logs',
        'manage:system',
    ],
    PERPANI: [
        'view:all',
        'manage:clubs',
        'verify:coaches',
        'issue:licenses',
        'view:reports',
    ],
    LEGAL: [
        'view:all',
        'view:audit_logs',
        'view:reports',
        'manage:documents',
    ],
    SCHOOL: [
        'view:school',
        'manage:students',
        'manage:schedules',
        'view:reports',
    ],
    EO: [
        'manage:events',
        'view:participants',
        'manage:budgets',
        'view:reports',
    ],
    JUDGE: [
        'verify:scores',
        'view:events',
        'view:participants',
    ],
    SUPPLIER: [
        'manage:products',
        'view:orders',
        'manage:staff',
        'view:sales',
    ],
    CLUB: [
        'manage:club',
        'view:club',
        'manage:athletes',
        'manage:coaches',
        'manage:staff',
        'manage:finances',
        'manage:inventory',
        'manage:schedules',
        'manage:documents',
        'view:reports',
        'manage:scores',
        'manage:production',
    ],
    COACH: [
        'view:club',
        'view:athletes',
        'manage:scores',
        'manage:schedules',
        'manage:attendance',
        'view:athlete_details',
        'add:training_notes',
    ],
    MANPOWER: [
        'view:club',
        'view:athletes',
        'manage:inventory',
        'manage:attendance',
        'view:finances',
        'verify:payments',
        'view:tasks',
        'manage:production',
    ],
    ATHLETE: [
        'view:own_profile',
        'update:own_profile',
        'view:own_scores',
        'view:schedules',
        'view:own_attendance',
        'view:leaderboard',
    ],
    PARENT: [
        'view:child_profile',
        'view:child_scores',
        'view:child_progress',
        'view:child_attendance',
        'view:billing',
        'upload:payment_proof',
    ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: Role, permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[role];

    // Super admin has all permissions
    if (permissions.includes('manage:all')) {
        return true;
    }

    return permissions.includes(permission);
};

/**
 * Check if role A has higher or equal authority than role B
 */
export const hasHigherAuthority = (roleA: Role, roleB: Role): boolean => {
    return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
};

/**
 * Middleware factory: Require specific roles
 */
export const requireRoles = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role as Role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                requiredRoles: allowedRoles,
                userRole: req.user.role,
            });
            return;
        }

        next();
    };
};

/**
 * Middleware factory: Require specific permission
 */
export const requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!hasPermission(req.user.role as Role, permission)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                requiredPermission: permission,
            });
            return;
        }

        next();
    };
};

/**
 * Middleware: Ensure user can only access their own club's data
 * SuperAdmin bypasses this check
 */
export const requireClubAccess = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    // SuperAdmin can access all clubs
    if (req.user.role === 'SUPER_ADMIN') {
        return next();
    }

    // Get clubId from params, query, or body
    const requestedClubId =
        req.params.clubId ||
        req.query.clubId ||
        req.body?.clubId;

    if (requestedClubId && requestedClubId !== req.user.clubId) {
        res.status(403).json({
            success: false,
            message: 'Access denied: You can only access your own club data',
        });
        return;
    }

    next();
};

/**
 * Middleware: Ensure athlete can only access their own data
 */
export const requireOwnData = (userIdParam: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Admin roles can access any data
        const adminRoles: Role[] = ['SUPER_ADMIN', 'CLUB', 'COACH', 'MANPOWER'];
        if (adminRoles.includes(req.user.role as Role)) {
            return next();
        }

        const requestedUserId = req.params[userIdParam];

        if (requestedUserId && requestedUserId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own data',
            });
            return;
        }

        next();
    };
};

/**
 * Middleware: Require minimum role level
 */
export const requireMinRole = (minRole: Role) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!hasHigherAuthority(req.user.role as Role, minRole)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient role level',
                requiredMinRole: minRole,
            });
            return;
        }

        next();
    };
};
