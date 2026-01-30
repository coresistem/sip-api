
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'andi@athlete.id';
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            coreId: true,
        },
    });

    if (user) {
        console.log(`User found: ${user.name} (${user.email})`);
        console.log(`CORE ID: ${user.coreId}`);
        console.log('CORE ID Type:', typeof user.coreId);
        console.log('CORE ID Length:', user.coreId?.length);
    } else {
        console.log(`User with email ${email} not found.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
