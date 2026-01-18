
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const usersWithAvatar = await prisma.user.findMany({
        where: {
            avatarUrl: { not: null }
        },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true }
    });

    console.log('Users with Avatar:', usersWithAvatar);

    const allParents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { id: true, name: true, createdAt: true, avatarUrl: true }
    });
    console.log('All Parents:', allParents);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
