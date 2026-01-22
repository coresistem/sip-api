import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const requests = await prisma.roleRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
            }
        });

        console.log('--- Role Requests ---');
        if (requests.length === 0) {
            console.log('No role requests found.');
        } else {
            requests.forEach(req => {
                console.log(`ID: ${req.id}`);
                console.log(`User: ${req.user.name} (${req.user.email})`);
                console.log(`Role: ${req.requestedRole}`);
                console.log(`NIK: ${req.nik}`);
                console.log(`Status: ${req.status}`);
                console.log(`KTP URL: ${req.ktpUrl}`);
                console.log(`Cert URL: ${req.certificateUrl}`);
                console.log('-------------------');
            });
        }
    } catch (error) {
        console.error('Error fetching role requests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
