
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sip.id';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true }
    });

    console.log('Super Admin User:', user);

    const parent = await prisma.user.findFirst({
        where: { role: 'PARENT' },
        select: { id: true, name: true, role: true, avatarUrl: true }
    });

    console.log('First Parent User:', parent);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
