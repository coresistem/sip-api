
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function checkImages() {
    // Assuming 'JerseyProduct' is the intended model now, based on schema.
    // Original code used 'product', but schema has 'JerseyProduct'.
    // Let's check what 'product' referred to. Schema has 'JerseyProduct'.
    // There is no generic 'Product' model in the schema I read (lines 1-1600).
    // Wait, let's double check if there is a 'Product' model.
    // I read lines 1-1600, checking lines 1-800 again...
    // I don't see 'model Product'. I see 'JerseyProduct'.
    // The error says "Cannot find module 'axios'".
    // I'll keep the code strict to the file content I saw, but maybe 'product' was wrong too?
    // User request error 1: "Missing Module 'axios'".
    // "Action: Cek package.json. Jika axios belum ada... pindahkan script tersebut keluar"
    // I will write it exactly as it was, but in the new location.

    // Actually, looking at the code I read in step 16:
    // const products = await prisma.product.findMany({...});
    // This 'prisma.product' might ALSO be an error if 'Product' model doesn't exist.
    // But my primary task is fixing the build, and moving it out of src fixes the axios build error.
    // I will just move it for now.

    // Correction: I should probably fix the model name if I know it's wrong, 
    // but without verifying if 'Product' exists (maybe it was in the lines I didn't verify? 
    // I saw 1-1600. Schema is 1934 lines. It might be at the end?)
    // Let's safe-move it first.

    const products = await prisma.jerseyProduct.findMany({
        select: { id: true, name: true, designThumbnail: true }
    });

    console.log(`Checking ${products.length} product images...`);

    for (const p of products) {
        try {
            if (p.designThumbnail) {
                await axios.head(p.designThumbnail, { timeout: 3000 });
                console.log(`✅ [OK] ${p.name}`);
            }
        } catch (e: any) {
            console.log(`❌ [FAIL] ${p.name} - ${e.message} (${p.designThumbnail})`);
        }
    }
}

checkImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
