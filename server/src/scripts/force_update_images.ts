
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// High reliability Unsplash source images
const RELIABLE_IMAGES: Record<string, string> = {
    'Magnetic Arrow Rest': 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&auto=format&fit=crop', // Archery target/gear
    'Professional Bow String': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop', // Bow detail
    'Pro Archery Jersey': 'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?w=800&auto=format&fit=crop', // Sportswear
    'Leather Arm Guard': 'https://images.unsplash.com/photo-1599586120429-48285b6a8a24?w=800&auto=format&fit=crop', // Archer aiming
    'Carbon Express Arrows': 'https://images.unsplash.com/photo-1554174465-b1a9967732d8?w=800&auto=format&fit=crop', // Arrows in quiver
    'Standard Recurve Bow': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop' // Female archer
};

async function main() {
    console.log('Force updating images...');
    for (const [name, url] of Object.entries(RELIABLE_IMAGES)) {
        const product = await prisma.product.findFirst({
            where: { name: { contains: name } }
        });
        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: { image: url }
            });
            console.log(`Updated: ${product.name}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
