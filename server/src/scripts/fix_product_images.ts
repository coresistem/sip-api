
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of product names to working Unsplash URLs
const IMAGE_UPDATES: Record<string, string> = {
    'Magnetic Arrow Rest': 'https://images.unsplash.com/photo-1599586120429-48285b6a8a24?w=800&auto=format&fit=crop',
    'Professional Bow String': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop', // Kept same but with w=800
    'Pro Archery Jersey': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop',
    'Leather Arm Guard': 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&auto=format&fit=crop', // Leather texture
    'Carbon Express Arrows': 'https://images.unsplash.com/photo-1554174465-b1a9967732d8?w=800&auto=format&fit=crop', // Arrows specific
    'Standard Recurve Bow': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop' // Archery specific
};

async function main() {
    try {
        console.log('Starting image updates...');

        for (const [name, url] of Object.entries(IMAGE_UPDATES)) {
            const product = await prisma.product.findFirst({
                where: { name: { contains: name } }
            });

            if (product) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { image: url }
                });
                console.log(`✅ Updated image for: ${product.name}`);
            } else {
                console.log(`⚠️ Product not found: ${name}`);
            }
        }

        console.log('Update complete.');
    } catch (e) {
        console.error('Error updating images:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
