
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const role = 'SUPER_ADMIN';
        console.log(`Resetting sidebar config for ${role}...`);
        // Delete custom config to revert to defaults (which includes all modules)
        const result = await prisma.sidebarRoleConfig.deleteMany({
            where: { role: role }
        });
        console.log(`Deleted ${result.count} custom configurations. Super Admin now uses system defaults.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
