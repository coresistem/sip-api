
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const parentName = 'omre';
    const parent = await prisma.user.findFirst({ where: { name: parentName } });
    if (!parent) {
        console.log('Parent not found');
        return;
    }

    console.log('Parent ID:', parent.id);

    // Check athletes linked to this parent
    const athletes = await prisma.athlete.findMany({
        where: { parentId: parent.id },
        include: { user: true }
    });

    console.log(`Found ${athletes.length} linked athletes.`);
    athletes.forEach(a => {
        console.log(`- Athlete ID: ${a.id}`);
        console.log(`  User ID: ${a.userId}`);
        console.log(`  Name: ${a.user?.name}`);
        console.log(`  NIK: ${a.user?.nik || 'NULL'}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
