import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAssemblies() {
    try {
        console.log('🔄 Starting assembly migration...\n');

        // 1. Update CLUB_OWNER assemblies to CLUB
        console.log('1️⃣ Migrating CLUB_OWNER assemblies to CLUB...');
        const clubUpdate = await prisma.featureAssembly.updateMany({
            where: { targetRole: 'CLUB_OWNER' },
            data: { targetRole: 'CLUB' }
        });
        console.log(`   ✅ Updated ${clubUpdate.count} assemblies from CLUB_OWNER to CLUB\n`);

        // 2. Copy CLUB assemblies for SCHOOL (same UI structure)
        console.log('2️⃣ Creating SCHOOL assemblies (copy from CLUB)...');
        const clubAssemblies = await prisma.featureAssembly.findMany({
            where: { targetRole: 'CLUB' },
            include: { parts: { include: { part: true } } }
        });

        let schoolCount = 0;
        for (const assembly of clubAssemblies) {
            // Check if SCHOOL version already exists
            const exists = await prisma.featureAssembly.findFirst({
                where: {
                    code: assembly.code.replace('_CLUB', '_SCHOOL'),
                    targetRole: 'SCHOOL'
                }
            });

            if (!exists) {
                await prisma.featureAssembly.create({
                    data: {
                        code: assembly.code.replace('_CLUB', '_SCHOOL'),
                        name: assembly.name.replace('Club', 'School'),
                        description: assembly.description?.replace('club', 'school') || null,
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
                schoolCount++;
            }
        }
        console.log(`   ✅ Created ${schoolCount} new SCHOOL assemblies\n`);

        // 3. Show summary
        console.log('📊 Current assembly distribution:');
        const summary = await prisma.featureAssembly.groupBy({
            by: ['targetRole'],
            _count: true
        });
        summary.forEach((s: any) => {
            console.log(`   ${s.targetRole}: ${s._count} assemblies`);
        });

        console.log('\n✨ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateAssemblies();
