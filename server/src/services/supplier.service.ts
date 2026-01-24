import prisma from '../lib/prisma.js';

/**
 * Resolves the effective supplier ID for a given user.
 * - If user is a SUPPLIER, it returns their own user ID.
 * - If user is a MANPOWER, it looks up their parent supplier ID from the manpower record.
 * - For others (except SUPER_ADMIN), it might return null.
 */
export async function getEffectiveSupplierId(user: { id: string; email: string; role: string }): Promise<string | null> {
    if (user.role === 'SUPPLIER') {
        return user.id;
    }

    if (user.role === 'MANPOWER') {
        const manpower = await prisma.manpower.findFirst({
            where: { email: user.email },
            select: { supplierId: true }
        });
        return manpower?.supplierId || null;
    }

    if (user.role === 'SUPER_ADMIN') {
        return null; // Admin sees everything later
    }

    return null;
}

export default {
    getEffectiveSupplierId
};
