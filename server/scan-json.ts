import prisma from './src/lib/prisma.js';

async function scanJsonFields() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                roles: true,
                coreIds: true,
                roleStatuses: true
            }
        });

        console.log(`Scanning ${users.length} users...`);
        let foundIssues = false;

        for (const user of users) {
            const fields = ['roles', 'coreIds', 'roleStatuses'];
            for (const field of fields) {
                const val = (user as any)[field];
                if (typeof val === 'string' && val.trim() !== '') {
                    try {
                        JSON.parse(val);
                    } catch (e) {
                        console.error(`ERROR: User ${user.email} has invalid JSON in ${field}: "${val}"`);
                        foundIssues = true;
                    }
                } else if (val === '') {
                    console.error(`WARNING: User ${user.email} has an empty string in ${field}`);
                    foundIssues = true;
                }
            }
        }

        if (!foundIssues) {
            console.log('No JSON issues found in User fields.');
        }
    } catch (error) {
        console.error('Scan failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

scanJsonFields();
