
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@sip.com' }
    });
    if (user) {
        console.log('✅ User Found:', user.email);
        console.log('Role:', user.role);
        console.log('Is Active:', user.isActive);
    } else {
        console.log('❌ User NOT Found');
    }
}

check().finally(() => prisma.$disconnect());
