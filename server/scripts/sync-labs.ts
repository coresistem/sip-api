import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const labFeatures = [
    {
        slug: 'onboarding-premium',
        name: 'Premium Onboarding',
        description: 'Prototipe alur pendaftaran atlet dengan desain premium dan validasi data real-time.',
        status: 'STANDALONE',
        isPublic: true,
        routePath: '/'
    },
    {
        slug: 'assessment-builder',
        name: 'Form & Assessment Builder',
        description: 'No-code dynamic form creator for custom evaluations.',
        status: 'IN_PROGRESS',
        isPublic: false,
        routePath: '/admin/module-builder'
    },
    {
        slug: 'dropdown-search',
        name: 'Dropdown Search Control',
        description: 'Premium searchable dropdown with multi-select and fuzzy filtering.',
        status: 'STANDALONE',
        isPublic: true,
        routePath: '/labs/dropdown-search'
    },
    {
        slug: 'data-integrity',
        name: 'Data Integrity: Redundancy Guard',
        description: 'AI-assisted duplicate detector to maintain data cleanliness.',
        status: 'STANDALONE',
        isPublic: true,
        routePath: '/labs/data-integrity'
    },
    {
        slug: 'flowchart',
        name: 'FlowChart',
        description: 'Panduan alur verifikasi data (Trust Chain) untuk Atlet, Klub, dan Perpani.',
        status: 'STANDALONE',
        isPublic: true,
        routePath: '/ecosystem-flow'
    },
    {
        slug: 'bleep-test',
        name: 'Pro Bleep Test',
        description: 'Aerobic capacity evaluation system with audio-sync protocol.',
        status: 'STANDALONE',
        isPublic: true,
        routePath: '/labs/bleep-test'
    }
];

async function main() {
    console.log('🔄 Syncing Lab Features to Database...');

    for (const lab of labFeatures) {
        const result = await prisma.labFeature.upsert({
            where: { slug: lab.slug },
            update: lab,
            create: lab
        });
        console.log(`✅ Synced: ${result.name} (${result.slug})`);
    }

    console.log('🏁 Lab Features Sync Complete!');
}

main()
    .catch((e) => {
        console.error('❌ Sync failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
