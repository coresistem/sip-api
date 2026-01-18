
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const supplier = await prisma.user.findFirst({
        where: { role: 'SUPPLIER' },
    });
    console.log('Supplier:', supplier);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
