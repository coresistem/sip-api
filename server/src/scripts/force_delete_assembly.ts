
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetCode = 'athlete_dashboard_widgets_v1'; // The deployed one

    console.log(`Attempting to delete assembly: ${targetCode}`);

    const assembly = await prisma.featureAssembly.findFirst({
        where: { code: targetCode }
    });

    if (!assembly) {
        console.log('Assembly not found.');
        return;
    }

    console.log(`Found assembly: ${assembly.name} (${assembly.status}). Deleting...`);

    // Delete parts first (cascade might handle it, but being safe)
    await prisma.featurePart.deleteMany({
        where: { featureId: assembly.id }
    });

    await prisma.featureAssembly.delete({
        where: { id: assembly.id }
    });

    console.log('✅ Assembly deleted successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
