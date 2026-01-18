
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sip.id';
    console.log(`Checking for user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:', user);

    const isMatch = await bcrypt.compare('superadmin123', user.passwordHash);
    console.log('Password match for "superadmin123":', isMatch);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
