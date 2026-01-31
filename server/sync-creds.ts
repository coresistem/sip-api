import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function syncCredentials() {
    try {
        const email = 'admin@sip.id';
        const passwordHash = await bcrypt.hash('c0r3@link001', 12);

        // Find existing admin or create new
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                passwordHash: passwordHash,
                isActive: true
            },
            create: {
                email: email,
                passwordHash: passwordHash,
                name: 'Super Administrator',
                role: 'SUPER_ADMIN',
                coreId: '00.0001.0001', // Fixed for README compatibility
                isActive: true
            }
        });

        console.log(`Successfully synced credentials for ${user.email}`);

        // Optional: Remove the other one to avoid confusion
        await prisma.user.deleteMany({
            where: {
                email: 'admin@core-panahan.id'
            }
        });
        console.log('Removed old admin@core-panahan.id');

    } catch (error) {
        console.error('Failed to sync credentials:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncCredentials();
