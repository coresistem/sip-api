
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding AppModules...');

    const modules = [
        {
            moduleId: 'auth',
            name: 'Authentication & Identity',
            description: 'Core login and user management',
            isEnabled: true,
            isCore: true
        },
        {
            moduleId: 'profile',
            name: 'User Profile',
            description: 'Personal data and avatar management',
            isEnabled: true,
            isCore: true
        }
    ];

    for (const mod of modules) {
        await prisma.appModule.upsert({
            where: { moduleId: mod.moduleId },
            update: mod,
            create: mod
        });
        console.log(`✅ Upserted ${mod.moduleId}`);
    }

    console.log('✨ Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
