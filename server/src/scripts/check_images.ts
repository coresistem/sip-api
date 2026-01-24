
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function checkImages() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, image: true }
    });

    console.log(`Checking ${products.length} product images...`);

    for (const p of products) {
        try {
            await axios.head(p.image, { timeout: 3000 });
            console.log(`✅ [OK] ${p.name}`);
        } catch (e: any) {
            console.log(`❌ [FAIL] ${p.name} - ${e.message} (${p.image})`);
        }
    }
}

checkImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
