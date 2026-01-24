import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Starting Role Calibration Migration...');

    try {
        // 1. Unify CLUB_OWNER into CLUB
        console.log('🔄 Migrating role: CLUB_OWNER -> CLUB...');
        const clubUpdates = await prisma.user.updateMany({
            where: { role: 'CLUB_OWNER' },
            data: { role: 'CLUB' }
        });
        console.log(`✅ Updated ${clubUpdates.count} users from CLUB_OWNER to CLUB.`);

        // 2. Standardize WORKER into MANPOWER
        console.log('🔄 Migrating role: WORKER -> MANPOWER...');
        const workerUpdates = await prisma.user.updateMany({
            where: { role: 'WORKER' },
            data: { role: 'MANPOWER' }
        });
        console.log(`✅ Updated ${workerUpdates.count} users from WORKER to MANPOWER.`);

        // 3. Update Manpower profiles that might have legacy 'WORKER' role internally (if any)
        console.log('🔄 Standardizing Manpower table roles...');
        const manpowerUpdates = await prisma.manpower.updateMany({
            where: { role: 'WORKER' },
            data: { role: 'MANPOWER' }
        });
        console.log(`✅ Updated ${manpowerUpdates.count} manpower records.`);

        // 4. Update Sidebar Configurations
        console.log('🔄 Updating Sidebar Configurations for CLUB_OWNER...');
        const sidebarUpdates = await prisma.sidebarRoleConfig.updateMany({
            where: { role: 'CLUB_OWNER' },
            data: { role: 'CLUB' }
        });
        console.log(`✅ Updated ${sidebarUpdates.count} sidebar configurations.`);

        console.log('✨ Role Calibration Migration Completed Successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
