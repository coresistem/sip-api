
import prisma from './src/lib/prisma.js';

async function checkUser() {
    console.log('Checking user adm@sip.id...');

    const user = await prisma.user.findUnique({
        where: { email: 'adm@sip.id' },
        include: {
            athlete: true,
            club: true
        }
    });

    if (!user) {
        console.log('User NOT FOUND');
        return;
    }

    console.log('User Data:', JSON.stringify(user, null, 2));
}

checkUser().catch(console.error).finally(() => prisma.$disconnect());
