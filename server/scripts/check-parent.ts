
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const parent = await prisma.user.findUnique({
        where: { id: 'cmlaya5ho002d3ltmelvjdigd' },
        select: { id: true, name: true, role: true, activeRole: true }
    });
    console.log('Parent user details:', JSON.stringify(parent, null, 2));
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
