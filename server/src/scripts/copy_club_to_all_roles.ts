import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All roles that should have the same UI as Club
const TARGET_ROLES = ['PERPANI', 'SCHOOL', 'ATHLETE', 'PARENT', 'COACH', 'JUDGE', 'EO', 'SUPPLIER', 'WORKER'];

async function copyClubToAllRoles() {
    try {
        console.log('🏭 Copying Club assemblies to all roles...\n');

        // Get Club assemblies as the template
        const clubAssemblies = await prisma.featureAssembly.findMany({
            where: { targetRole: 'CLUB' },
            include: { parts: { include: { part: true } } }
        });

        console.log(`📋 Found ${clubAssemblies.length} Club assemblies to replicate\n`);

        let totalCreated = 0;
        let totalSkipped = 0;

        for (const targetRole of TARGET_ROLES) {
            console.log(`\n🎯 Processing ${targetRole}...`);
            let roleCreated = 0;
            let roleSkipped = 0;

            for (const assembly of clubAssemblies) {
                // Generate new code for this role
                const newCode = assembly.code.replace('club', targetRole.toLowerCase());

                // Check if already exists
                const exists = await prisma.featureAssembly.findUnique({
                    where: { code: newCode }
                });

                if (exists) {
                    roleSkipped++;
                    continue;
                }

                // Create assembly for this role
                await prisma.featureAssembly.create({
                    data: {
                        code: newCode,
                        name: assembly.name.replace('Club', targetRole.charAt(0) + targetRole.slice(1).toLowerCase()),
                        description: assembly.description?.replace(/club/gi, targetRole.toLowerCase()) || null,
                        targetRole: targetRole,
                        targetPage: assembly.targetPage,
                        route: assembly.route,
                        status: assembly.status,
                        version: assembly.version,
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
                roleCreated++;
            }

            console.log(`   ✅ Created: ${roleCreated} | ⏭️  Skipped: ${roleSkipped}`);
            totalCreated += roleCreated;
            totalSkipped += roleSkipped;
        }

        console.log(`\n📊 Total Summary:`);
        console.log(`   Created: ${totalCreated} assemblies`);
        console.log(`   Skipped: ${totalSkipped} assemblies`);

        // Show final distribution
        console.log(`\n📈 Assembly distribution by role:`);
        const summary = await prisma.featureAssembly.groupBy({
            by: ['targetRole'],
            _count: true
        });
        summary.sort((a, b) => a.targetRole.localeCompare(b.targetRole));
        summary.forEach((s: any) => {
            console.log(`   ${s.targetRole.padEnd(15)}: ${s._count} assemblies`);
        });

        console.log('\n✨ All roles now have the same UI!');
    } catch (error) {
        console.error('❌ Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

copyClubToAllRoles();
