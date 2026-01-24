import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting SIP ID Calibration ---');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (!user.sipId) continue;

        const parts = user.sipId.split('.');
        if (parts.length === 3) {
            const roleCode = parts[0];
            const ppcc = parts[1];
            const seq = parts[2];

            // If PPCC is '0000' or empty, change to '9999' as per protocol
            if (ppcc === '0000' || !ppcc) {
                const newSipId = `${roleCode}.9999.${seq}`;
                console.log(`Calibrating ${user.email}: ${user.sipId} -> ${newSipId}`);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { sipId: newSipId }
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
