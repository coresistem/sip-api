import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking database connection...');
        await prisma.$connect();
        console.log('Connected.');

        // Verify table info using Raw Query
        const info: any = await prisma.$queryRawUnsafe('PRAGMA table_info(athletes)');
        console.log('Athlete Table Info:');
        info.forEach((col: any) => {
            console.log(`Column: ${col.name}, Type: ${col.type}, NotNull: ${col.notnull}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
