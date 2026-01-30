import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting CORE ID Calibration ---');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (!user.coreId) continue;

        const parts = user.coreId.split('.');
        if (parts.length === 3) {
            const roleCode = parts[0];
            const ppcc = parts[1];
            const seq = parts[2];

            // If PPCC is '0000' or empty, change to '9999' as per protocol
            if (ppcc === '0000' || !ppcc) {
                const newCoreId = `${roleCode}.9999.${seq}`;
                console.log(`Calibrating ${user.email}: ${user.coreId} -> ${newCoreId}`);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { coreId: newCoreId }
                });
            }
        }
    }

    console.log('--- Calibration Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
