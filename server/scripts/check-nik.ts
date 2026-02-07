
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { coreId: '04.3674.0006' },
        select: { id: true, name: true, nik: true, whatsapp: true }
    });
    console.log('Result for 04.3674.0006:', user);
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
