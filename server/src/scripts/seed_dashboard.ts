import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Assembly Hierarchy...');

    // 1. Ensure System Parts (including placeholder for profile)
    const extraParts = [
        { code: 'profile_details', name: 'Profile Details', type: 'FULLSTACK', category: 'admin', componentPath: '@/components/profile/ProfileWrapper' },
        // Admin Modules
        { code: 'athletes_mgmt', name: 'Athletes Management', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/AthletesPage' },
        { code: 'finance_mgmt', name: 'Finance', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/FinancePage' },
        { code: 'inventory_mgmt', name: 'Inventory', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/InventoryPage' },
        { code: 'reports_mgmt', name: 'Reports', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/ReportsPage' },
        { code: 'org_mgmt', name: 'Organization', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/OrganizationPage' },
        { code: 'manpower_mgmt', name: 'Manpower', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/ManpowerPage' },
        { code: 'file_mgmt', name: 'File Manager', type: 'FULLSTACK', category: 'admin', componentPath: '@/pages/admin/FileManagerPage' },
    ];

    // Existing parts from previous seed are assumed to exist.
    // I will upsert the profile one just in case.
    for (const p of extraParts) {
        await prisma.systemPart.upsert({
            where: { code: p.code },
            update: {},
            create: {
                code: p.code,
                name: p.name,
                type: p.type as any,
                category: p.category as any,
                description: 'Placeholder part',
                componentPath: p.componentPath,
                propsSchema: '{}',
                isCore: false,
                status: 'ACTIVE'
            }
        });
    }

    // 2. Define Assemblies

    // Common assemblies template
    const createAssembliesForRole = (prefix: string) => [
        {
            code: `${prefix}_profile_v1`,
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        // ... (I need to be careful not to replace the whole body and miss huge chunks if I don't give full content)
        // Actually, I can use a smaller chunk for the definition and another for the calls.
        // But wait, the function is huge.
        // I will just change the definition line.

        {
            code: `${prefix}_dashboard_v1`,
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [{ code: 'top_performers', order: 0 }] // Simplified dashboard
        },
        {
            code: `${prefix}_athletes_v1`,
            name: 'Athletes',
            targetPage: 'athletes',
            parts: [{ code: 'athletes_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_schedules_v1`,
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: `${prefix}_scoring_v1`,
            name: 'Scoring',
            targetPage: 'scoring',
            parts: [{ code: 'scoring', order: 0 }]
        },
        {
            code: `${prefix}_bleeptest_v1`,
            name: 'Bleep Test',
            targetPage: 'bleeptest',
            parts: [{ code: 'bleeptest', order: 0 }]
        },
        {
            code: `${prefix}_attendance_v1`,
            name: 'Attendance',
            targetPage: 'attendance',
            parts: [{ code: 'attendance', order: 0 }]
        },
        {
            code: `${prefix}_finance_v1`,
            name: 'Finance',
            targetPage: 'finance',
            parts: [{ code: 'finance_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_inventory_v1`,
            name: 'Inventory',
            targetPage: 'inventory',
            parts: [{ code: 'inventory_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_analytics_v1`,
            name: 'Analytics',
            targetPage: 'analytics',
            parts: [{ code: 'analytics', order: 0 }]
        },
        {
            code: `${prefix}_reports_v1`,
            name: 'Reports',
            targetPage: 'reports',
            parts: [{ code: 'reports_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_digital_id_v1`,
            name: 'Digital ID Card',
            targetPage: 'digital_id',
            parts: [{ code: 'digital_id_card', order: 0 }]
        },
        {
            code: `${prefix}_archer_config_v1`,
            name: 'Archer Config',
            targetPage: 'archer_config',
            parts: [{ code: 'archer_config', order: 0 }]
        },
        {
            code: `${prefix}_org_v1`,
            name: 'Organization',
            targetPage: 'organization',
            parts: [{ code: 'org_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_manpower_v1`,
            name: 'Manpower',
            targetPage: 'manpower',
            parts: [{ code: 'manpower_mgmt', order: 0 }]
        },
        {
            code: `${prefix}_files_v1`,
            name: 'File Manager',
            targetPage: 'filemanager',
            parts: [{ code: 'file_mgmt', order: 0 }]
        },
        // Folder: Jersey Shop
        {
            code: `${prefix}_jersey_catalog_v1`,
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: `${prefix}_my_orders_v1`,
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const athleteAssemblies = [
        {
            code: 'athlete_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'athlete_dashboard_widgets_v1',
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [
                { code: 'index_arrow_timeline', order: 0 },
                { code: 'bmi_timeline', order: 1 },
                { code: 'training_performance_timeline', order: 2 },
                { code: 'top_performers', order: 3 },
            ]
        },
        {
            code: 'athlete_schedules_v1',
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: 'athlete_scoring_v1',
            name: 'Scoring',
            targetPage: 'scoring',
            parts: [{ code: 'scoring', order: 0 }]
        },
        {
            code: 'athlete_bleeptest_v1',
            name: 'Bleep Test',
            targetPage: 'bleeptest',
            parts: [{ code: 'bleeptest', order: 0 }]
        },
        {
            code: 'athlete_attendance_v1',
            name: 'Attendance',
            targetPage: 'attendance',
            parts: [{ code: 'attendance', order: 0 }]
        },
        {
            code: 'athlete_analytics_v1',
            name: 'Analytics',
            targetPage: 'analytics',
            parts: [{ code: 'analytics', order: 0 }]
        },
        {
            code: 'athlete_digital_id_v1',
            name: 'Digital ID Card',
            targetPage: 'digital_id',
            parts: [{ code: 'digital_id_card', order: 0 }]
        },
        {
            code: 'athlete_archer_config_v1',
            name: 'Archer Config',
            targetPage: 'archer_config',
            parts: [{ code: 'archer_config', order: 0 }]
        },
        // Folder: Jersey Shop
        {
            code: 'athlete_jersey_catalog_v1',
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: 'athlete_my_orders_v1',
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const perpaniAssemblies = createAssembliesForRole('perpani');
    const clubAssemblies = createAssembliesForRole('club');
    const schoolAssemblies = createAssembliesForRole('school'); // Similar to club for now

    const coachAssemblies = [
        {
            code: 'coach_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'coach_dashboard_v1',
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [{ code: 'top_performers', order: 0 }]
        },
        {
            code: 'coach_athletes_v1',
            name: 'My Athletes',
            targetPage: 'athletes',
            parts: [{ code: 'athletes_mgmt', order: 0 }]
        },
        {
            code: 'coach_schedules_v1',
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: 'coach_scoring_v1',
            name: 'Scoring',
            targetPage: 'scoring',
            parts: [{ code: 'scoring', order: 0 }]
        },
        {
            code: 'coach_bleeptest_v1',
            name: 'Bleep Test',
            targetPage: 'bleeptest',
            parts: [{ code: 'bleeptest', order: 0 }]
        },
        {
            code: 'coach_attendance_v1',
            name: 'Attendance',
            targetPage: 'attendance',
            parts: [{ code: 'attendance', order: 0 }]
        },
        {
            code: 'coach_jersey_catalog_v1',
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: 'coach_my_orders_v1',
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const parentAssemblies = [
        {
            code: 'parent_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'parent_dashboard_v1',
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [{ code: 'top_performers', order: 0 }]
        },
        {
            code: 'parent_schedules_v1',
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: 'parent_jersey_catalog_v1',
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: 'parent_my_orders_v1',
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const judgeAssemblies = [
        {
            code: 'judge_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'judge_dashboard_v1',
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [{ code: 'top_performers', order: 0 }]
        },
        {
            code: 'judge_scoring_v1',
            name: 'Scoring',
            targetPage: 'scoring',
            parts: [{ code: 'scoring', order: 0 }]
        },
        {
            code: 'judge_schedules_v1',
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: 'judge_jersey_catalog_v1',
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: 'judge_my_orders_v1',
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const eoAssemblies = [
        {
            code: 'eo_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'eo_dashboard_v1',
            name: 'Dashboard',
            targetPage: 'dashboard',
            parts: [{ code: 'top_performers', order: 0 }]
        },
        {
            code: 'eo_schedules_v1',
            name: 'Schedules',
            targetPage: 'schedules',
            parts: [{ code: 'schedule', order: 0 }]
        },
        {
            code: 'eo_finance_v1',
            name: 'Finance',
            targetPage: 'finance',
            parts: [{ code: 'finance_mgmt', order: 0 }]
        },
        {
            code: 'eo_jersey_catalog_v1',
            name: 'Jersey Shop/Jersey Catalog',
            targetPage: 'jersey_catalog',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'catalog' } }]
        },
        {
            code: 'eo_my_orders_v1',
            name: 'Jersey Shop/My Orders',
            targetPage: 'my_orders',
            parts: [{ code: 'jersey_shop', order: 0, props: { view: 'orders' } }]
        }
    ];

    const supplierAssemblies = [
        {
            code: 'supplier_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'supplier_dashboard_v1',
            name: 'Dashboard',
            targetPage: 'jersey/admin', // Special dashboard for supplier
            parts: [{ code: 'top_performers', order: 0 }]
        },
        {
            code: 'supplier_products_v1',
            name: 'My Products',
            targetPage: 'supplier/products',
            parts: [{ code: 'inventory_mgmt', order: 0 }] // Reusing inventory part for products for now
        },
        {
            code: 'supplier_orders_v1',
            name: 'Supplier Orders',
            targetPage: 'supplier/orders',
            parts: [{ code: 'reports_mgmt', order: 0 }] // Reusing reports for orders placeholder
        }
    ];

    const workerAssemblies = [
        {
            code: 'worker_profile_v1',
            name: 'Profile Details',
            targetPage: 'profile',
            parts: [{ code: 'profile_details', order: 0 }]
        },
        {
            code: 'worker_station_v1',
            name: 'Worker Station',
            targetPage: 'jersey/worker/station',
            parts: [{ code: 'manpower_mgmt', order: 0 }] // Placeholder
        }
    ];

    const allRoles = [
        { role: 'ATHLETE', items: athleteAssemblies },
        { role: 'PERPANI', items: perpaniAssemblies },
        { role: 'CLUB_OWNER', items: clubAssemblies },
        { role: 'SCHOOL_ADMIN', items: schoolAssemblies },
        { role: 'PARENT', items: parentAssemblies },
        { role: 'COACH', items: coachAssemblies },
        { role: 'JUDGE', items: judgeAssemblies },
        { role: 'EO', items: eoAssemblies },
        { role: 'SUPPLIER', items: supplierAssemblies },
        { role: 'WORKER', items: workerAssemblies },
    ];

    const creator = 'system_migration_bot';

    // Fetch all system parts to map codes to IDs
    const allParts = await prisma.systemPart.findMany();
    const partMap = new Map(allParts.map(p => [p.code, p.id]));

    for (const roleGroup of allRoles) {
        console.log(`Seeding for role: ${roleGroup.role}`);
        for (const def of roleGroup.items) {
            // Upsert Assembly
            let assembly = await prisma.featureAssembly.findUnique({
                where: { code: def.code }
            });

            if (!assembly) {
                assembly = await prisma.featureAssembly.create({
                    data: {
                        code: def.code,
                        name: def.name,
                        targetRole: roleGroup.role,
                        targetPage: def.targetPage,
                        status: 'DEPLOYED',
                        version: 1,
                        description: `Migrated ${def.name}`,
                        createdById: creator
                    }
                });
                console.log(`Created Assembly: ${def.name}`);
            } else {
                // Update name and targetPage
                await prisma.featureAssembly.update({
                    where: { id: assembly.id },
                    data: {
                        name: def.name,
                        targetPage: def.targetPage,
                        status: 'DEPLOYED', // Ensure deployed status
                        targetRole: roleGroup.role // Ensure role is correct
                    }
                });
                console.log(`Updated Assembly: ${def.name} (${roleGroup.role})`);
            }

            // Sync Parts
            await prisma.featurePart.deleteMany({
                where: { featureId: assembly.id }
            });

            for (const item of def.parts) {
                const partId = partMap.get(item.code);
                if (!partId) {
                    console.warn(`Part not found: ${item.code} for ${def.code}`);
                    // Optionally fallback to a default part or create it if critical
                    continue;
                }

                const props = (item as any).props;

                await prisma.featurePart.create({
                    data: {
                        featureId: assembly.id,
                        partId: partId,
                        sortOrder: item.order,
                        propsConfig: props ? JSON.stringify(props) : '{}',
                        section: 'main'
                    }
                });
            }
        }
    }

    console.log('Hierarchy Seeding Complete');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
