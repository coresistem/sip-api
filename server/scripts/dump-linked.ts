import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const parentUsername = 'omre';
    const parent = await prisma.user.findFirst({ where: { name: parentUsername } });
    if (!parent) {
        console.log('Parent not found');
        return;
    }

    const linked = await prisma.athlete.findMany({
        where: { parentId: parent.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    whatsapp: true,
                    nik: true,
                    coreId: true
                }
            }
        }
    });

    console.log('Linked Athletes for', parentUsername, ':');
    console.log(JSON.stringify(linked, null, 2));

    await prisma.$disconnect();
}

main();
