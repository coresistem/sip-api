import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSchoolAssemblies() {
    try {
        console.log('🏫 Creating SCHOOL assemblies from CLUB template...\n');

        const clubAssemblies = await prisma.featureAssembly.findMany({
            where: { targetRole: 'CLUB' },
            include: { parts: { include: { part: true } } }
        });

        let created = 0;
        let skipped = 0;

        for (const assembly of clubAssemblies) {
            const schoolCode = `${assembly.code.replace('CLUB', 'SCHOOL')}`;

            // Check if already exists
            const exists = await prisma.featureAssembly.findUnique({
                where: { code: schoolCode }
            });

            if (exists) {
                console.log(`   ⏭️  Skipping ${schoolCode} (already exists)`);
                skipped++;
                continue;
            }

            await prisma.featureAssembly.create({
                data: {
                    code: schoolCode,
                    name: assembly.name.replace('Club', 'School'),
                    description: assembly.description?.replace(/club/gi, 'school') || null,
                    targetRole: 'SCHOOL',
                    targetPage: assembly.targetPage,
                    route: assembly.route,
                    status: assembly.status,
                    version: 1,
                    createdById: assembly.createdById,
                    approvedById: assembly.approvedById,
                    approvedAt: assembly.approvedAt,
                    deployedAt: assembly.deployedAt,
                    previewConfig: assembly.previewConfig,
                    parts: {
                        create: assembly.parts.map((fp) => ({
                            partId: fp.partId,
                            section: fp.section,
                            sortOrder: fp.sortOrder,
                            propsConfig: fp.propsConfig,
                            dataBinding: fp.dataBinding,
                            showCondition: fp.showCondition
                        }))
                    }
                }
            });
            console.log(`   ✅ Created ${schoolCode}`);
            created++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created} assemblies`);
        console.log(`   Skipped: ${skipped} assemblies`);
        console.log('\n✨ Done!');
    } catch (error) {
        console.error('❌ Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSchoolAssemblies();
