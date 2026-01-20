
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding audit logs...');

    // 1. Get some users to attribute logs to
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const athlete = await prisma.user.findFirst({ where: { role: 'ATHLETE' } });
    const coach = await prisma.user.findFirst({ where: { role: 'COACH' } });
    const club = await prisma.user.findFirst({ where: { role: 'CLUB' } });

    const performAction = async (user: any, action: string, entity: string, entityId: string | null = null, oldVal: any = null, newVal: any = null, ip: string = '127.0.0.1') => {
        if (!user) return;

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action,
                entity,
                entityId,
                oldValues: oldVal ? JSON.stringify(oldVal) : null,
                newValues: newVal ? JSON.stringify(newVal) : null,
                ipAddress: ip,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)) // Random time in last 7 days
            }
        });
    };

    if (superAdmin) {
        // Super Admin Actions
        await performAction(superAdmin, 'LOGIN', 'AUTH', null, null, null, '192.168.1.100');
        await performAction(superAdmin, 'UPDATE', 'USER', 'u123', { role: 'ATHLETE' }, { role: 'COACH' });
        await performAction(superAdmin, 'CREATE', 'EVENT', 'e456', null, { name: 'Jakarta Open 2024' });
        await performAction(superAdmin, 'DELETE', 'POST', 'p789', { title: 'Old Announcement' }, null);
        await performAction(superAdmin, 'PAGE_VIEW', 'ADMIN_DASHBOARD', null);
    }

    if (club) {
        // Club Actions
        await performAction(club, 'LOGIN', 'AUTH');
        await performAction(club, 'UPDATE', 'CLUB', 'c101', { phone: '0812' }, { phone: '0813' });
        await performAction(club, 'CREATE', 'MEMBER', 'm202', null, { name: 'New Member' });
        await performAction(club, 'PAGE_VIEW', 'FINANCE_DASHBOARD');
    }

    if (coach) {
        // Coach Actions
        await performAction(coach, 'LOGIN', 'AUTH');
        await performAction(coach, 'CREATE', 'TRAINING_SESSION', 't303', null, { date: '2024-02-20' });
        await performAction(coach, 'UPDATE', 'ATHLETE_SCORE', 's404', { score: 280 }, { score: 285 });
    }

    if (athlete) {
        // Athlete Actions
        await performAction(athlete, 'LOGIN', 'AUTH');
        await performAction(athlete, 'UPDATE', 'PROFILE', 'p505', { height: 170 }, { height: 172 });
        await performAction(athlete, 'PAGE_VIEW', 'SCORING_PAGE');
    }

    // Generate a bulk of random logs for pagination testing
    if (superAdmin) {
        const actions = ['LOGIN', 'PAGE_VIEW', 'UPDATE', 'CREATE', 'DELETE'];
        const entities = ['USER', 'EVENT', 'CLUB', 'SCORE', 'INVENTORY', 'PAYMENT'];

        for (let i = 0; i < 40; i++) {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            const randomEntity = entities[Math.floor(Math.random() * entities.length)];
            const randomIp = `192.168.1.${Math.floor(Math.random() * 255)}`;

            await performAction(superAdmin, randomAction, randomEntity, `id-${Math.random().toString(36).substr(2, 9)}`, null, { note: 'Random generated action' }, randomIp);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
