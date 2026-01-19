import { PrismaClient } from '@prisma/client';

// Single Prisma client instance for the application
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error', 'info', 'warn'], // Enable info/warn in production for debugging
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

// Debug connection on startup
prisma.$connect()
    .then(() => {
        console.log('✅ Prisma connected successfully');
        const dbUrl = process.env.DATABASE_URL || '';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
        console.log(`🔌 Database URL: ${maskedUrl}`);
    })
    .catch((e) => {
        console.error('❌ Prisma connection failed:', e);
        const dbUrl = process.env.DATABASE_URL || '';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
        console.error(`🔌 Attempted URL: ${maskedUrl}`);
    });

export default prisma;
