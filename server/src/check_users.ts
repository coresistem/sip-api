import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                sipId: { in: ['99.6501.0001', '02.0000.0001'] }
            },
            select: {
                id: true,
                sipId: true,
                role: true,
                activeRole: true,
                roles: true,
                name: true
            }
        });
        console.log('--- Target Users ---');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error querying users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
