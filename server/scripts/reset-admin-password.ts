
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sip.id';
    const password = 'admin123';

    console.log(`Resetting password for ${email}...`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { passwordHash },
        });
        console.log('✅ Password reset successful');
        console.log(`New password: ${password}`);
    } catch (error) {
        console.error('❌ Failed to reset password:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
