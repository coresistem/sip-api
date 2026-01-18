
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Competition Data...');

    // 1. Get EO User
    const eoUser = await prisma.user.findFirst({ where: { role: 'EO' } });
    if (!eoUser) {
        console.error('EO User not found. Run reset_and_verify first.');
        return;
    }

    // 2. Create Competition
    const competition = await prisma.competition.create({
        data: {
            name: 'Bandung Archery Championship 2026',
            slug: 'bandung-archery-2026-seed',
            location: 'Stadion Siliwangi',
            city: 'Bandung',
            status: 'ONGOING', // or OPEN_REGISTRATION
            startDate: new Date('2026-02-20'),
            endDate: new Date('2026-02-22'),
            eoId: eoUser.id,
            description: 'Annual archery championship seeded for testing',

            // Categories
            categories: {
                create: [
                    {
                        division: 'RECURVE',
                        ageClass: 'GENERAL',
                        gender: 'MALE',
                        distance: 70,
                        quota: 100,
                        fee: 150000
                    },
                    {
                        division: 'COMPOUND',
                        ageClass: 'GENERAL',
                        gender: 'FEMALE',
                        distance: 50,
                        quota: 100,
                        fee: 150000
                    }
                ]
            }
        }
    });

    console.log(`✓ Competition created: ${competition.name} (${competition.id})`);

    // 3. Create Registrations
    // Find some athletes
    const athletes = await prisma.athlete.findMany({ include: { user: true }, take: 5 });

    // Get Created Categories
    const categories = await prisma.competitionCategory.findMany({ where: { competitionId: competition.id } });

    if (athletes.length > 0 && categories.length > 0) {
        for (const athlete of athletes) {
            const category = categories[0]; // Just put everyone in first category

            // Check if already registered
            const existing = await prisma.competitionRegistration.findUnique({
                where: {
                    categoryId_athleteId: {
                        categoryId: category.id,
                        athleteId: athlete.id
                    }
                }
            });

            if (!existing) {
                await prisma.competitionRegistration.create({
                    data: {
                        competitionId: competition.id,
                        athleteId: athlete.id,
                        categoryId: category.id,
                        status: 'PAID',
                        qualificationScore: 650,
                        rank: 1
                    }
                });
                console.log(`  + Athlete registered: ${athlete.user.name}`);
            } else {
                console.log(`  . Athlete already registered: ${athlete.user.name}`);
            }
        }
    } else {
        console.log('! No athletes found to register.');
    }

    console.log('✅ Seeding Complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
