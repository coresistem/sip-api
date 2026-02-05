import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const coreId = '04.3674.0002';

    console.log(`🔍 Finding user with CORE ID: ${coreId}`);

    const user = await prisma.user.findUnique({
        where: { coreId },
        include: { athlete: true }
    });

    if (!user) {
        console.error(`❌ User with CORE ID ${coreId} not found.`);
        process.exit(1);
    }

    console.log(`👤 Found User: ${user.name} (ID: ${user.id})`);

    // Update User
    await prisma.user.update({
        where: { id: user.id },
        data: { clubId: null }
    });
    console.log('✅ User.clubId cleared.');

    // Update Athlete if exists
    if (user.athlete) {
        await prisma.athlete.update({
            where: { id: user.athlete.id },
            data: { clubId: null }
        });
        console.log('✅ Athlete.clubId cleared.');
    }

    console.log('🚀 Club affiliation successfully cleared for testing.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
