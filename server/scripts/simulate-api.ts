import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function simulate() {
    const parentUsername = 'omre';
    const parentUser = await prisma.user.findFirst({ where: { name: parentUsername } });

    if (!parentUser) {
        console.log('Parent user not found');
        return;
    }

    const userId = parentUser.id;

    // Simulate backend logic in profile.controller.ts
    const linkedAthletes = await prisma.athlete.findMany({
        where: { parentId: userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    coreId: true,
                    whatsapp: true,
                    nik: true,
                    nikVerified: true,
                },
            },
            club: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    const flattened = linkedAthletes.map((a: any) => ({
        ...a,
        nik: a.user?.nik || '',
        whatsapp: a.user?.whatsapp || '',
        nikVerified: a.user?.nikVerified || false
    }));

    console.log('--- RAW PRISMA RESULT (First item) ---');
    console.log(JSON.stringify(linkedAthletes[0], null, 2));

    console.log('\n--- FLATTENED RESULT (First item) ---');
    console.log(JSON.stringify(flattened[0], null, 2));

    await prisma.$disconnect();
}

simulate();
