
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for Super Admin user...');
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@sip.id' }
        });

        if (user) {
            console.log('User found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                sipId: user.sipId
            });
        } else {
            console.log('User admin@sip.id NOT FOUND.');
            const allUsers = await prisma.user.findMany({
                select: { email: true, role: true }
            });
            console.log('Available users:', allUsers);
        }
    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
