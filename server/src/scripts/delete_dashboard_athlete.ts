
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const target = 'Dashboard Athlete';

    console.log(`Searching for: ${target}`);

    const assemblies = await prisma.featureAssembly.findMany({
        where: { name: { contains: 'Dashboard' } },
        include: { parts: true }
    });

    console.log(`Found ${assemblies.length} assemblies:`);
    assemblies.forEach(a => {
        console.log(`- ${a.name} (${a.code}): ${a.status}, ${a.parts.length} parts (ID: ${a.id})`);
    });

    // Find and delete "Dashboard Athlete"
    const toDelete = assemblies.find(a => a.name === target);
    if (toDelete) {
        console.log(`\nDeleting: ${toDelete.name}...`);
        await prisma.featureAssembly.delete({ where: { id: toDelete.id } });
        console.log('✅ Deleted successfully!');
    } else {
        console.log(`\n❌ "${target}" not found.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
