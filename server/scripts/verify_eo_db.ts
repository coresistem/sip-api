
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DB VERIFICATION START ---');

    try {
        const eoUser = await prisma.user.findUnique({
            where: { email: 'eo@events.id' }
        });

        if (eoUser) {
            console.log('EO User Found:');
            console.log('ID:', eoUser.id);
            console.log('Email:', eoUser.email);
            console.log('Role:', eoUser.role);
            console.log('Is Active:', eoUser.isActive);
            console.log('Updated At:', eoUser.updatedAt?.toISOString());
            console.log('Password Hash (first 20 chars):', eoUser.passwordHash.substring(0, 20) + '...');

            // Verify password
            const isValid = await bcrypt.compare('eventorganizer123', eoUser.passwordHash);
            console.log('--- PASSWORD CHECK ---');
            console.log("Testing 'eventorganizer123':", isValid ? '✅ MATCH' : '❌ FAIL');

        } else {
            console.log('ERROR: EO User NOT FOUND in this database.');
        }

    } catch (e) {
        console.error('Verification Error:', e);
    } finally {
        await prisma.$disconnect();
        console.log('--- DB VERIFICATION END ---');
    }
}

main();
