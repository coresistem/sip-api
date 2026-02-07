import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEAR ATHLETE CLUB ID ---');

    // Find athlete user
    const athlete = await prisma.user.findFirst({
        where: { name: 'Tes101112' }
    });

    if (!athlete) {
        console.log('Error: Athlete user not found');
        return;
    }

    // Clear clubId
    await prisma.user.update({
        where: { id: athlete.id },
        data: { clubId: null }
    });

    console.log(`Cleared clubId for athlete: ${athlete.name} (ID: ${athlete.id})`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
