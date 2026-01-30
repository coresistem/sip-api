import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                email: 'andi@athlete.id'
            },
            select: {
                id: true,
                coreId: true,
                role: true,
                activeRole: true,
                roles: true,
                name: true
            }
        });
        console.log('--- Verification (Core ID): Andi Pranata ---');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error querying users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
