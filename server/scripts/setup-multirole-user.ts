
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'multirole@sip.id';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`Setting up multi-role user: ${email}`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            roles: JSON.stringify(['ATHLETE', 'COACH']),
            activeRole: 'ATHLETE',
            passwordHash: hashedPassword,
            isActive: true,
        },
        create: {
            email,
            name: 'Multi Role User',
            passwordHash: hashedPassword,
            roles: JSON.stringify(['ATHLETE', 'COACH']),
            activeRole: 'ATHLETE',
            role: 'ATHLETE', // Primary role
            isActive: true,
        },
    });

    console.log(`User created/updated: ${user.email}`);
    console.log(`Roles: ${user.roles}`);
    console.log(`Active Role: ${user.activeRole}`);
    console.log(`\nTest Credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nTry POST /api/v1/auth/switch-role with body { "role": "COACH" }`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
