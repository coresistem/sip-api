import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const competitions = await prisma.competition.findMany();
    console.log('Competitions in DB:', competitions.length);
    competitions.forEach(c => console.log(`- ${c.name} (${c.id})`));

    const registrations = await prisma.competitionRegistration.findMany();
    console.log('Total Registrations:', registrations.length);
}

check().catch(console.error).finally(() => prisma.$disconnect());
