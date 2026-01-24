
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.product.count();
        console.log(`Total Products: ${count}`);

        if (count > 0) {
            const products = await prisma.product.findMany({ take: 3 });
            console.log('Sample Products:', JSON.stringify(products, null, 2));
        } else {
            console.log('No products found. Seeding might be needed.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
