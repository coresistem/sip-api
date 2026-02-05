
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const modules = await prisma.appModule.findMany();
    console.log(JSON.stringify(modules, null, 2));
}

check().finally(() => prisma.$disconnect());
