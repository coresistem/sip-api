
import { PrismaClient } from '@prisma/client';
import { UserRepositoryPort, UserDomain } from '../ports/user.repository.port.js';
import prisma from '../../../lib/prisma.js';

export class PrismaUserAdapter implements UserRepositoryPort {
    private client: PrismaClient = prisma;

    async findByEmail(email: string): Promise<UserDomain | null> {
        const user = await this.client.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                club: { select: { id: true, name: true } },
                athlete: { select: { id: true } },
                manpower: { select: { shortcuts: true } },
            },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            passwordHash: user.passwordHash,
            role: user.role,
            coreId: user.coreId,
            clubId: user.clubId,
            isActive: user.isActive,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
            activeRole: user.activeRole,
            coreIds: user.coreIds,
            roleStatuses: user.roleStatuses,
        } as UserDomain;
    }

    async findById(id: string): Promise<UserDomain | null> {
        const user = await this.client.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            passwordHash: user.passwordHash,
            role: user.role,
            coreId: user.coreId,
            clubId: user.clubId,
            isActive: user.isActive,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
            activeRole: user.activeRole,
            coreIds: user.coreIds,
            roleStatuses: user.roleStatuses,
        } as UserDomain;
    }

    async create(user: Omit<UserDomain, 'id' | 'isActive'>): Promise<UserDomain> {
        const newUser = await this.client.user.create({
            data: {
                email: user.email.toLowerCase(),
                passwordHash: user.passwordHash,
                name: user.name,
                role: user.role,
                coreId: user.coreId,
                clubId: user.clubId,
            },
        });

        return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            passwordHash: newUser.passwordHash,
            role: newUser.role,
            coreId: newUser.coreId,
            clubId: newUser.clubId,
            isActive: newUser.isActive,
        } as UserDomain;
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.client.user.update({
            where: { id },
            data: { lastLogin: new Date() },
        });
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this.client.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
}
