
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        where: { name: 'Tes101112' },
        select: { id: true, name: true, nik: true, coreId: true, activeRole: true, role: true }
    });
    console.log('Users named Tes101112:', JSON.stringify(users, null, 2));

    // Also check linked athletes for ANY parent
    const athletes = await prisma.athlete.findMany({
        where: { user: { name: 'Tes101112' } },
        include: {
            user: { select: { id: true, name: true, nik: true } },
            parent: { select: { id: true, name: true } }
        }
    });
    console.log('Linked Athlete records for Tes101112:', JSON.stringify(athletes, null, 2));

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
