
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const athleteName = 'Tes101112';
    const athlete = await prisma.athlete.findFirst({
        where: { user: { name: athleteName } },
        include: {
            user: true,
            parent: true
        }
    });

    if (!athlete) {
        console.log('Athlete not found');
        return;
    }

    console.log('--- ATHLETE DATA ---');
    console.log('ID:', athlete.id);
    console.log('Name:', athlete.user?.name);
    console.log('NIK (User Table):', athlete.user?.nik);
    console.log('CoreID:', athlete.user?.coreId);
    console.log('ParentID:', athlete.parentId);
    console.log('Parent Name:', athlete.parent?.name);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
