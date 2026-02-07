import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFY DATA V2 ---');

    // Find parent user
    const parent = await prisma.user.findUnique({
        where: { email: 'test101112@parent.id' }
    });

    if (!parent) {
        console.log('Error: Parent user not found');
        return;
    }

    console.log(`Parent: ${parent.name} (ID: ${parent.id})`);

    // Find linked athletes
    const athletes = await prisma.athlete.findMany({
        where: { parentId: parent.id },
        include: {
            user: true
        }
    });

    console.log(`Found ${athletes.length} linked athletes.`);

    for (const a of athletes) {
        console.log(`Athlete ID: ${a.id}`);
        console.log(`Name: ${a.user?.name}`);
        console.log(`User.NIK: ${a.user?.nik || 'UNDEFINED/NULL'}`);
        console.log(`User.WhatsApp: ${a.user?.whatsapp || 'UNDEFINED/NULL'}`);
        console.log(`User.clubId: ${a.user?.clubId || 'NULL'}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
