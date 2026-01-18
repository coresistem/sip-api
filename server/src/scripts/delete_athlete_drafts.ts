
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetRole = 'ATHLETE';
    const status = 'DRAFT';

    console.log(`Checking for ${status} assemblies in ${targetRole}...`);

    const drafts = await prisma.featureAssembly.findMany({
        where: {
            targetRole,
            status
        }
    });

    if (drafts.length === 0) {
        console.log('No drafts found.');
        return;
    }

    console.log(`Found ${drafts.length} drafts:`);
    drafts.forEach(d => console.log(`- ${d.name} (${d.code})`));

    console.log('Deleting...');

    for (const draft of drafts) {
        // Delete feature parts first
        await prisma.featurePart.deleteMany({
            where: { featureId: draft.id }
        });

        await prisma.featureAssembly.delete({
            where: { id: draft.id }
        });
        console.log(`Deleted ${draft.name}`);
    }

    console.log('✅ All drafts deleted.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
