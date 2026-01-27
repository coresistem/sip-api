
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Create a local instance with no logging
const prisma = new PrismaClient({
    log: ['error'], // Only log errors
});

const accounts = [
    { email: 'admin@sip.id', password: 'superadmin123', role: 'SUPER_ADMIN' },
    { email: 'perpani@perpani.or.id', password: 'perpani123', role: 'PERPANI' },
    { email: 'owner@archeryclub.id', password: 'clubowner123', role: 'CLUB' },
    { email: 'school@sma1.sch.id', password: 'school123', role: 'SCHOOL' },
    { email: 'andi@athlete.id', password: 'athlete123', role: 'ATHLETE' },
    { email: 'parent@mail.id', password: 'parent123', role: 'PARENT' },
    { email: 'coach@archeryclub.id', password: 'coach123', role: 'COACH' },
    { email: 'judge@perpani.or.id', password: 'judge123', role: 'JUDGE' },
    { email: 'eo@events.id', password: 'eo123', role: 'EO' },
    { email: 'supplier@archeryshop.id', password: 'supplier123', role: 'SUPPLIER' },
    { email: 'manpower@sip.id', password: 'manpower123', role: 'MANPOWER' },
];

async function checkAccounts() {
    console.log('Checking accounts...');

    for (const account of accounts) {
        const user = await prisma.user.findUnique({
            where: { email: account.email },
        });

        if (!user) {
            console.log(`❌ [${account.role}] ${account.email}: User NOT FOUND`);
            continue;
        }

        const isPasswordValid = await bcrypt.compare(account.password, user.passwordHash);
        const status = isPasswordValid ? '✅ VALID' : '❌ INVALID PASSWORD';
        const activeStatus = user.isActive ? 'Active' : 'INACTIVE';

        console.log(`[${account.role}] ${account.email}: User Found | Status: ${activeStatus} | Password: ${status}`);
    }

    await prisma.$disconnect();
}

checkAccounts().catch((e) => {
    console.error(e);
    process.exit(1);
});
