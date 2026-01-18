
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Using bcryptjs as seen in other files, or fallback to 'bcrypt' if project uses it. 
// Note: verify package.json for bcrypt vs bcryptjs usage. 
// Previous script 'reset_admin_pw.ts' used 'bcrypt'. I will use 'bcrypt' to match.

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting EO password...');
    try {
        const passwordHash = await bcrypt.hash('eo123456', 10);

        // Find first, to be sure
        const user = await prisma.user.findUnique({
            where: { email: 'eo@events.id' }
        });

        if (!user) {
            console.log('User eo@events.id NOT FOUND. Creating it...');
            // Fallback: This user should exist from seed, but if not found, create simple one
            // Note: Creating might fail on foreign keys/profiles if not Careful. 
            // But for now, just update is the goal.
            console.error('EO User not found! Seed might have failed.');
            return;
        }

        await prisma.user.update({
            where: { email: 'eo@events.id' },
            data: { passwordHash }
        });
        console.log('Password for eo@events.id reset to: eventorganizer123');
    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
