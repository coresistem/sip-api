import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPER_ADMIN_GROUPS = [
    {
        id: 'general',
        label: 'General',
        icon: 'LayoutDashboard',
        color: 'primary',
        modules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'my_orders', 'catalog']
    },
    {
        id: 'athlete',
        label: 'Athlete',
        icon: 'Target',
        color: 'blue',
        modules: ['scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history']
    },
    {
        id: 'coach',
        label: 'Coach',
        icon: 'Users',
        color: 'green',
        modules: ['coach_analytics', 'score_validation', 'athletes', 'schedules', 'attendance']
    },
    {
        id: 'club',
        label: 'Club',
        icon: 'Building2',
        color: 'orange',
        modules: ['organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports']
    },
    {
        id: 'school',
        label: 'School',
        icon: 'GraduationCap',
        color: 'emerald',
        modules: ['schools', 'o2sn_registration']
    },
    {
        id: 'parent',
        label: 'Parent',
        icon: 'Heart',
        color: 'purple',
        modules: ['payments']
    },
    {
        id: 'eo',
        label: 'Event Organizer',
        icon: 'Calendar',
        color: 'teal',
        modules: ['events', 'event_creation', 'event_registration', 'event_results']
    },
    {
        id: 'judge',
        label: 'Judge',
        icon: 'Scale',
        color: 'indigo',
        modules: ['score_validation']
    },
    {
        id: 'supplier',
        label: 'Supplier',
        icon: 'Package',
        color: 'rose',
        modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'jersey_staff', 'inventory']
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: 'Settings',
        color: 'red',
        modules: ['admin', 'audit_logs']
    }
];

async function main() {
    console.log('Seeding Sidebar Config for SUPER_ADMIN...');

    await prisma.sidebarRoleConfig.upsert({
        where: { role: 'SUPER_ADMIN' },
        update: {
            groups: JSON.stringify(SUPER_ADMIN_GROUPS)
        },
        create: {
            role: 'SUPER_ADMIN',
            groups: JSON.stringify(SUPER_ADMIN_GROUPS)
        }
    });

    console.log('Sidebar Config Seeding Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
