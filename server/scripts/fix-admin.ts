
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sip.id';
    const password = 'c0r3@link001';

    console.log(`Fixing Super Admin account: ${email}`);

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                isActive: true,
                role: 'SUPER_ADMIN'
            },
            create: {
                email,
                name: 'Super Admin',
                passwordHash,
                role: 'SUPER_ADMIN',
                isActive: true,
                coreId: '00.0000.0001'
            }
        });

        console.log('✅ Super Admin account secured.');
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${user.role}`);

    } catch (error) {
        console.error('❌ Failed to fix admin account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
