
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Adding [scoring] plugin to AppModule table...');
    // @ts-ignore - Prisma client out of sync due to file locking on Windows NPS
    const result = await (prisma as any).appModule.upsert({
        where: { moduleId: 'scoring' },
        update: {
            isEnabled: true,
            name: 'Athlete Scoring',
            description: 'Log training and competition results',
            isCore: false
        },
        create: {
            moduleId: 'scoring',
            isEnabled: true,
            name: 'Athlete Scoring',
            description: 'Log training and competition results',
            isCore: false
        }
    });
    console.log('✅ Success:', result.moduleId);
}

seed().finally(() => prisma.$disconnect());
