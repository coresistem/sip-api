
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                isExclusive: true, // Checking this flag specifically
                stock: true
            }
        });
        console.log('--- Product Visibility Check ---');
        console.log(JSON.stringify(products, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
