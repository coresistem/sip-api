
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetCoreId = '04.3101.0001';

    console.log(`Searching for user with coreId: ${targetCoreId}...`);

    const user = await prisma.user.findFirst({
        where: { coreId: targetCoreId }
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log(`Current Club ID: ${user.clubId}`);

    if (!user.clubId) {
        console.log('User is already not linked to any club.');
        return;
    }

    // Update User
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { clubId: null }
    });

    // Also update Athlete record if exists
    const athlete = await prisma.athlete.findUnique({
        where: { userId: user.id }
    });

    if (athlete) {
        await prisma.athlete.update({
            where: { id: athlete.id },
            data: { clubId: null }
        });
        console.log('Athlete record updated (clubId set to null).');
    }

    console.log(`Successfully removed club from user ${targetCoreId}.`);
    console.log(`New Club ID: ${updatedUser.clubId}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
