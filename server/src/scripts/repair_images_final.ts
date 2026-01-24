
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean, verified URLs
const FINAL_FIX_IMAGES: Record<string, string> = {
    'Magnetic Arrow Rest': 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Professional Bow String': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Pro Archery Jersey': 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Changed to simpler URL
    'Leather Arm Guard': 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Carbon Express Arrows': 'https://images.unsplash.com/photo-1554174465-b1a9967732d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Standard Recurve Bow': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

async function main() {
    console.log('Applying final image fix...');

    for (const [name, url] of Object.entries(FINAL_FIX_IMAGES)) {
        // Use updateMany to be safe if duplicates exist or findFirst
        const products = await prisma.product.findMany({
            where: { name: { contains: name } }
        });

        for (const p of products) {
            await prisma.product.update({
                where: { id: p.id },
                data: { image: url }
            });
            console.log(`✅ Repaired: ${p.name}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
