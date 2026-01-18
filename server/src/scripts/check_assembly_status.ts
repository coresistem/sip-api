
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking assemblies for athlete role...');
    const assemblies = await prisma.featureAssembly.findMany({
        where: {
            targetRole: 'ATHLETE'
        },
        select: {
            id: true,
            name: true,
            code: true,
            status: true,
            targetRole: true
        }
    });

    const fs = require('fs');
    let output = 'Found assemblies:\n';
    assemblies.forEach(a => {
        output += `- [${a.targetRole}] ${a.name} (${a.code}): ${a.status} (ID: ${a.id})\n`;
    });
    fs.writeFileSync('status_report.txt', output);
    console.log('Report saved to status_report.txt');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
