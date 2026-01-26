import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Jersey System Data ---');

    try {
        const productCount = await prisma.jerseyProduct.count();
        console.log(`Jersey Products: ${productCount}`);

        const orderCount = await prisma.jerseyOrder.count();
        console.log(`Jersey Orders: ${orderCount}`);

        const manpowerCount = await prisma.manpower.count();
        console.log(`Manpower: ${manpowerCount}`);

        const commerceProductCount = await prisma.product.count();
        console.log(`Unified Commerce Products: ${commerceProductCount}`);

        const commerceOrderCount = await prisma.order.count();
        console.log(`Unified Commerce Orders: ${commerceOrderCount}`);

        const userCount = await prisma.user.count();
        console.log(`Total Users: ${userCount}`);

        const supplierCount = await prisma.user.count({
            where: { role: 'SUPPLIER' }
        });
        console.log(`Suppliers: ${supplierCount}`);

        if (productCount > 0) {
            const products = await prisma.jerseyProduct.findMany({
                take: 5,
                include: { variants: true }
            });
            console.log('\nSample Products:');
            products.forEach(p => {
                console.log(`- ${p.name} (SKU: ${p.sku}) [Price: ${p.basePrice}] - Variants: ${p.variants.length}`);
            });
        }

    } catch (error) {
        console.error('Error checking jersey data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
