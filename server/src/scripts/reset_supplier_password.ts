
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('Supplier123!', 12);
    await prisma.user.updateMany({
        where: { role: 'SUPPLIER' },
        data: { passwordHash }
    });
    console.log('Updated supplier password to Supplier123!');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
