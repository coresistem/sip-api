import prisma from './src/lib/prisma.js';

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                roles: true,
                coreIds: true,
                isActive: true
            }
        });
        console.log('--- User List ---');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Failed to list users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
