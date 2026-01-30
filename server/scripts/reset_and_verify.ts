
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RESET & VERIFY EO PASSWORD ---');
    try {
        const email = 'eo@events.id';
        const newPassword = 'eventorganizer123';

        console.log(`Hashing password: '${newPassword}'`);
        const passwordHash = await bcrypt.hash(newPassword, 10);

        console.log(`Updating user: ${email}`);
        const user = await prisma.user.upsert({
            where: { email },
            update: { passwordHash, isActive: true },
            create: {
                email,
                passwordHash,
                name: 'Event Organizer',
                role: 'EO',
                isActive: true,
                coreId: '08.0000.0001' // Fallback CORE ID
            }
        });

        console.log('User Updated/Created:', user.id);
        console.log('New Hash stored:', user.passwordHash.substring(0, 20) + '...');

        // IMMEDIATE VERIFICATION
        const verifyMatch = await bcrypt.compare(newPassword, user.passwordHash);
        console.log('Immediate Verification Match:', verifyMatch ? '✅ SUCCESS' : '❌ FAIL');

    } catch (e) {
        console.error('Error during reset/verify:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
