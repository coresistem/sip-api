
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting Super Admin password...');
    try {
        const passwordHash = await bcrypt.hash('superadmin123', 10);
        await prisma.user.update({
            where: { email: 'admin@sip.id' },
            data: { passwordHash }
        });
        console.log('Password reset to: superadmin123');
    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
