import prisma from '../src/lib/prisma.js';

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                isActive: true,
                name: true,
                id: true
            }
        });
        console.log('User List:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
