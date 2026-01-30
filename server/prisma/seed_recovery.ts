import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SIDEBAR_CONFIGS = [
    {
        role: 'SUPER_ADMIN',
        groups: [
            { id: 'general', label: 'General', icon: 'LayoutDashboard', color: 'primary', modules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'my_orders', 'catalog'] },
            { id: 'athlete', label: 'Athlete', icon: 'Target', color: 'blue', modules: ['scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history'] },
            { id: 'coach', label: 'Coach', icon: 'Users', color: 'green', modules: ['coach_analytics', 'score_validation', 'athletes', 'schedules', 'attendance'] },
            { id: 'club', label: 'Club', icon: 'Building2', color: 'orange', modules: ['organization', 'finance', 'inventory', 'club_members', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports'] },
            { id: 'school', label: 'School', icon: 'GraduationCap', color: 'emerald', modules: ['schools', 'o2sn_registration'] },
            { id: 'parent', label: 'Parent', icon: 'Heart', color: 'purple', modules: ['payments'] },
            { id: 'eo', label: 'Event Organizer', icon: 'Calendar', color: 'teal', modules: ['events', 'event_creation', 'event_registration', 'event_results'] },
            { id: 'judge', label: 'Judge', icon: 'Scale', color: 'indigo', modules: ['score_validation'] },
            { id: 'supplier', label: 'Supplier', icon: 'Package', color: 'rose', modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'jersey_staff', 'inventory'] },
            { id: 'admin', label: 'Admin', icon: 'Settings', color: 'red', modules: ['admin', 'audit_logs'] }
        ]
    }
];

async function main() {
    console.log('🚀 Starting recovery seeding...');

    // 1. Seed Super Admin
    const saEmail = 'admin@sip.id';
    const saPassword = await bcrypt.hash('superadmin123', 12);

    console.log(`Setting up Super Admin: ${saEmail}...`);
    const superAdmin = await prisma.user.upsert({
        where: { email: saEmail },
        update: { passwordHash: saPassword },
        create: {
            email: saEmail,
            passwordHash: saPassword,
            name: 'Super Administrator',
            role: 'SUPER_ADMIN',
            phone: '+62812000000',
            coreId: '00.9999.0001'
        }
    });
    console.log('✓ Super Admin ready.');

    // 2. Seed Sidebar Configs
    console.log('Setting up Sidebar Configurations...');
    for (const config of SIDEBAR_CONFIGS) {
        await prisma.sidebarRoleConfig.upsert({
            where: { role: config.role },
            update: { groups: JSON.stringify(config.groups) },
            create: {
                role: config.role,
                groups: JSON.stringify(config.groups)
            }
        });
        console.log(`✓ Sidebar Config ready for ${config.role}`);
    }

    console.log('✅ Recovery seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Recovery seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
