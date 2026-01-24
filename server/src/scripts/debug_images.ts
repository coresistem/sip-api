
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listProducts() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, image: true }
    });

    console.log('--- Current Products in DB ---');
    products.forEach(p => {
        console.log(`[${p.name}] -> ${p.image}`);
    });
}

listProducts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
