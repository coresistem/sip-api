
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const email = 'admin@sip.id';
        console.log(`Checking user with email: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User NOT found.');
        } else {
            console.log('User found:');
            console.log(`- ID: ${user.id}`);
            console.log(`- Active: ${user.isActive}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Password Hash exists: ${!!user.passwordHash}`);
            console.log(`- Created At: ${user.createdAt}`);
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
