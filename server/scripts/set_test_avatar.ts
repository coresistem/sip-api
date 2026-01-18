
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sip.id';
    // Use a public placeholder image for testing
    const testAvatarUrl = 'https://ui.shadcn.com/avatars/02.png';

    const user = await prisma.user.update({
        where: { email },
        data: { avatarUrl: testAvatarUrl }
    });

    console.log('Updated Super Admin avatar:', user);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
