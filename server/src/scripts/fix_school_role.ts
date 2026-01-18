import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSchoolRole() {
    const result = await prisma.featureAssembly.updateMany({
        where: { targetRole: 'SCHOOL_ADMIN' },
        data: { targetRole: 'SCHOOL' }
    });
    console.log(`✅ Updated ${result.count} assemblies from SCHOOL_ADMIN to SCHOOL`);
    await prisma.$disconnect();
}

fixSchoolRole();
