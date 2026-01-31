import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function check() {
    try {
        const u = await prisma.user.findUnique({
            where: { email: 'admin@sip.id' }
        });

        if (!u) {
            console.log('User not found: admin@sip.id');
            return;
        }

        console.log('User found:');
        console.log('ID:', u.id);
        console.log('Email:', u.email);
        console.log('IsActive:', u.isActive);
        console.log('Role:', u.role);
        console.log('Password hash start:', u.passwordHash.substring(0, 10));

        const testPass = 'c0r3@link001';
        const isMatch = await bcrypt.compare(testPass, u.passwordHash);
        console.log(`Password match test for '${testPass}':`, isMatch);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
