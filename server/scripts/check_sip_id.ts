
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
            sipId: true,
        },
    });

    if (user) {
        console.log(`User found: ${user.name} (${user.email})`);
        console.log(`SIP ID: ${user.sipId}`);
        console.log('SIP ID Type:', typeof user.sipId);
        console.log('SIP ID Length:', user.sipId?.length);
    } else {
        console.log(`User with email ${email} not found.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
