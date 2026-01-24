
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MODULES_DATA = [
    // 1. FOUNDATION (Core) 🔘
    {
        code: 'foundation',
        name: 'Foundation (Core)',
        category: 'FOUNDATION',
        moduleType: 'UNIVERSAL',
        description: 'Essential system features required for all users.',
        subModules: [
            { code: 'auth', name: 'Auth & Session' },
            { code: 'profile', name: 'Profile & Identity' },
            { code: 'notification', name: 'Notification System' },
            { code: 'file_manager', name: 'File Manager' }
        ]
    },
    // 2. COMMERCE & FINANCE 🟢
    {
        code: 'commerce',
        name: 'Commerce & Finance',
        category: 'COMMERCE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['CLUB', 'SUPPLIER', 'SUPER_ADMIN'],
        description: 'Sales, inventory, and financial management.',
        subModules: [
            {
                code: 'catalog',
                name: 'Product Catalog',
                options: [
                    { code: 'allow_variants', label: 'Allow Product Variants', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            },
            { code: 'inventory', name: 'Inventory (Simple)' },
            {
                code: 'orders',
                name: 'Order Processing',
                options: [
                    { code: 'auto_confirm', label: 'Auto Confirm Orders', type: 'BOOLEAN', defaultValue: 'false' }
                ]
            },
            { code: 'finance', name: 'Finance & Invoicing' }
        ]
    },
    // 3. MANUFACTURING & OPS (Jersey Specific) 🟠
    {
        code: 'manufacturing',
        name: 'Manufacturing & Ops',
        category: 'OPS',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['SUPPLIER', 'MANPOWER'],
        description: 'End-to-end production tracking for manufacturers.',
        subModules: [
            { code: 'timeline', name: 'Production Timeline (Gantt)' },
            { code: 'workstation', name: 'Workstation Assignment' },
            { code: 'qc', name: 'QC & Inspection' },
            { code: 'logistics', name: 'Courier & Logistics' },
            { code: 'repair', name: 'Repair Handling (RMA)' }
        ]
    },
    // 4. SPORT & EVENT 🔵
    {
        code: 'sport',
        name: 'Sport & Event',
        category: 'SPORT',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE', 'COACH', 'CLUB'],
        description: 'Archery specific features for athletes and clubs.',
        subModules: [
            { code: 'scoring', name: 'Scoring System' },
            { code: 'training', name: 'Training Schedule' },
            { code: 'bleep', name: 'Bleep Test (VO2 Max)' },
            { code: 'attendance', name: 'QR Attendance' },
            { code: 'equipment', name: 'Equipment Config Advisor' }
        ]
    },
    // 5. ADMIN UTILITIES 🔴
    {
        code: 'admin',
        name: 'Admin Utilities',
        category: 'ADMIN',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['SUPER_ADMIN', 'No.1'], // Assuming No.1 is a specific role or just Admin
        description: 'System management tools.',
        subModules: [
            { code: 'user_mgmt', name: 'User Management' },
            { code: 'module_builder', name: 'Module Builder' },
            { code: 'permissions', name: 'Role Permissions' }
        ]
    },
    // 6. ATHLETE (Role/House) 🏹
    // Foundation Module - Personal Information Collection
    {
        code: 'athlete_foundation',
        name: 'Athlete Foundation',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Core modules for Athlete role: Personal Information, Notification, File Manager',
        subModules: [
            {
                code: 'personal_info',
                name: 'Personal Information Collection',
                options: [
                    { code: 'account_verification', label: 'Account Verification', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            },
            {
                code: 'notification_sys',
                name: 'Notification System',
                options: [
                    { code: 'inbox_outbox', label: 'Inbox/Outbox Message SIP', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            },
            {
                code: 'file_manager',
                name: 'File Manager',
                options: [
                    { code: 'file_upload', label: 'File Name, Upload', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            },
            {
                code: 'archer_details',
                name: 'Archer Details',
                options: [
                    { code: 'division', label: 'Division', type: 'TEXT', defaultValue: '' },
                    { code: 'gender', label: 'Gender', type: 'TEXT', defaultValue: '' },
                    { code: 'shooting_distance', label: 'Shooting Distance', type: 'TEXT', defaultValue: '' },
                    { code: 'date_of_birth', label: 'Date of Birth', type: 'DATE', defaultValue: '' },
                    { code: 'body_weight', label: 'Body Weight (kg)', type: 'NUMBER', defaultValue: '' },
                    { code: 'body_height', label: 'Body Height (cm)', type: 'NUMBER', defaultValue: '' },
                    { code: 'eye_dominant', label: 'Eye Dominant', type: 'TEXT', defaultValue: '' },
                    { code: 'handedness', label: 'Right/Left Handed', type: 'TEXT', defaultValue: '' },
                    { code: 'medical_history', label: 'Medical History', type: 'TEXT', defaultValue: '' }
                ]
            }
        ]
    },

    // [Mod] Dashboard
    {
        code: 'athlete_dashboard',
        name: '[Mod] Dashboard',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Athlete Dashboard with performance timelines and statistics',
        subModules: [
            { code: 'index_arrow_timeline', name: '[Sub] Index Arrow Timeline' },
            { code: 'bmi_timeline', name: '[Sub] BMI Timeline' },
            { code: 'training_performance_timeline', name: '[Sub] Training Performance Timeline' },
            { code: 'top_performers', name: '[Sub] Top Performers' }
        ]
    },

    // [Mod] Digital ID Card
    {
        code: 'athlete_digital_id',
        name: '[Mod] Digital ID Card',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Digital identification card for athletes',
        subModules: [
            {
                code: 'id_card_settings',
                name: 'ID Card Settings',
                options: [
                    { code: 'show_qr', label: 'Show QR Code', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'show_stats', label: 'Show Statistics', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            }
        ]
    },

    // [Mod] Archery Guidance
    {
        code: 'athlete_archery_guidance',
        name: '[Mod] Archery Guidance',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Safety guidelines and equipment recommendations for archers',
        subModules: [
            {
                code: 'safety_in_archery',
                name: '[Sub] Safety in Archery',
                options: [
                    { code: 'no_safety_no_archery', label: 'No Safety No Archery - Cek area sekitar target', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'preparation_check', label: 'Preparation Check - Pengecekan peralatan', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'follow_the_signal', label: 'Follow the Signal - Ikuti aba-aba pelatih', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'watch_your_back', label: 'Watch your Back - Perhatikan belakang saat pencabutan', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'its_forbidden', label: 'Its Forbidden - Larangan penggunaan tidak standar', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'arrow_in_quiver', label: 'Arrow in Quiver - Anak panah di quiver', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'careful_with_bow', label: 'Careful with your Bow - Jaga limbs dari kerusakan', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            },
            {
                code: 'equipment_preferences',
                name: '[Sub] Equipment Preferences',
                options: [
                    { code: 'bow_recommendation', label: 'Bow Recommendation (Draw Length)', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'arrow_recommendation_std', label: 'Arrow Recommendation - Standard/Recurve/Barebow', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'arrow_recommendation_compound', label: 'Arrow Recommendation - Compound', type: 'BOOLEAN', defaultValue: 'true' },
                    { code: 'safety_accessories', label: 'Safety Accessories (Finger Tab, Arm Guard, Chest Guard, etc)', type: 'BOOLEAN', defaultValue: 'true' }
                ]
            }
        ]
    },

    // [Mod] Archer Configuration
    {
        code: 'athlete_archer_config',
        name: '[Mod] Archer Configuration',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Detailed bow and arrow configuration settings',
        subModules: [
            {
                code: 'bow_settings',
                name: 'Bow Settings',
                options: [
                    { code: 'bow_height', label: 'Bow Height', type: 'TEXT', defaultValue: '' },
                    { code: 'brace_height', label: 'Brace Height (cm)', type: 'NUMBER', defaultValue: '' },
                    { code: 'draw_length', label: 'Draw Length (inch)', type: 'NUMBER', defaultValue: '' },
                    { code: 'draw_weight', label: 'Draw Weight (lbs)', type: 'NUMBER', defaultValue: '' },
                    { code: 'tiller_a_top', label: 'A-Tiller Top (mm)', type: 'NUMBER', defaultValue: '' },
                    { code: 'tiller_b_bottom', label: 'B-Tiller Bottom (mm)', type: 'NUMBER', defaultValue: '' },
                    { code: 'tiller_diff', label: 'Diff Tiller (Positive/Neutral/Negative)', type: 'TEXT', defaultValue: '' },
                    { code: 'nocking_point', label: 'Nocking Point (mm)', type: 'NUMBER', defaultValue: '' }
                ]
            },
            {
                code: 'arrow_settings',
                name: 'Arrow Settings',
                options: [
                    { code: 'arrow_size', label: 'Arrow Size', type: 'TEXT', defaultValue: '' },
                    { code: 'arrow_material', label: 'Material (Carbon, Alloy, MixCarbon, Fiber, Bamboo, Wood)', type: 'TEXT', defaultValue: '' },
                    { code: 'arrow_spine_size', label: 'Spine/Size', type: 'TEXT', defaultValue: '' },
                    { code: 'arrow_length', label: 'Length (inch)', type: 'NUMBER', defaultValue: '' },
                    { code: 'arrow_point', label: 'Point (grain)', type: 'NUMBER', defaultValue: '' },
                    { code: 'vanes_type', label: 'Vanes Type (Spinwing, Rubber, Feather)', type: 'TEXT', defaultValue: '' },
                    { code: 'vanes_size', label: 'Vanes Size (1.75", 2.0", 2.25", 2.5", 3.0", 4.0-5.0")', type: 'TEXT', defaultValue: '' }
                ]
            }
        ]
    },

    // [Mod] Analytics
    {
        code: 'athlete_analytics',
        name: '[Mod] Analytics',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Performance analytics and recommendations',
        subModules: [
            {
                code: 'archer_analytics',
                name: '[Sub] Archer',
                options: [
                    { code: 'age_category', label: 'Age Category (U10, U13, U15, U18, U21, Senior, Master 50+)', type: 'TEXT', defaultValue: '' },
                    { code: 'bmi', label: 'Body Mass Index (BMI)', type: 'NUMBER', defaultValue: '' },
                    { code: 'eye_vs_handed', label: 'Eye vs Handed Analysis', type: 'TEXT', defaultValue: '' },
                    { code: 'medical_issue', label: 'Have Medical Issue: Consult with Doctor', type: 'BOOLEAN', defaultValue: 'false' }
                ]
            },
            {
                code: 'bow_size_analytics',
                name: '[Sub] Bow Size',
                options: [
                    { code: 'bow_height_recommendation', label: 'Bow Height Recommendation', type: 'TEXT', defaultValue: '' }
                ]
            },
            {
                code: 'brace_height_analytics',
                name: '[Sub] Brace Height',
                options: [
                    { code: 'brace_height_config', label: 'Brace Height Config Recommendation', type: 'TEXT', defaultValue: '' }
                ]
            },
            {
                code: 'nocking_point_analytics',
                name: '[Sub] Nocking Point',
                options: [
                    { code: 'nocking_point_config', label: 'Nocking Point Config Recommendation', type: 'TEXT', defaultValue: '' }
                ]
            },
            {
                code: 'arrow_analytics',
                name: '[Sub] Arrow',
                options: [
                    { code: 'arrow_config', label: 'Arrow Config Recommendation', type: 'TEXT', defaultValue: '' }
                ]
            }
        ]
    },

    // [Mod] Training Schedule
    {
        code: 'athlete_training_schedule',
        name: '[Mod] Training Schedule',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Training schedule management for technique, fitness, and mental',
        subModules: [
            { code: 'technique', name: '[Sub] Technique' },
            { code: 'fitness', name: '[Sub] Fitness' },
            { code: 'mental', name: '[Sub] Mental' }
        ]
    },

    // [Mod] Scoring
    {
        code: 'athlete_scoring',
        name: '[Mod] Scoring',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Scoring records and history for athletes',
        subModules: [
            { code: 'scoring_history', name: 'Scoring History' },
            { code: 'scoring_statistics', name: 'Scoring Statistics' }
        ]
    },

    // [Mod] Event
    {
        code: 'athlete_event',
        name: '[Mod] Event',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Event participation and registration management',
        subModules: [
            { code: 'calendar', name: '[Sub] Calendar' },
            { code: 'registration', name: '[Sub] Registration' },
            { code: 'participant_record', name: '[Sub] Participant Record' }
        ]
    },

    // Appendix - Reference Data
    {
        code: 'athlete_appendix',
        name: 'Appendix - Reference Data',
        category: 'ATHLETE',
        moduleType: 'ROLE_SPECIFIC',
        targetRoles: ['ATHLETE'],
        description: 'Reference data for bow, arrow, brace height, and nocking point recommendations',
        subModules: [
            {
                code: 'bow_recommendation_ref',
                name: 'Bow Recommendation Reference',
                options: [
                    { code: 'draw_14_16', label: 'Draw Length 14-16 inch = Bow Height 48"', type: 'TEXT', defaultValue: '48' },
                    { code: 'draw_17_20', label: 'Draw Length 17-20 inch = Bow Height 54"', type: 'TEXT', defaultValue: '54' },
                    { code: 'draw_20_22', label: 'Draw Length 20-22 inch = Bow Height 62"', type: 'TEXT', defaultValue: '62' },
                    { code: 'draw_22_24', label: 'Draw Length 22-24 inch = Bow Height 62"', type: 'TEXT', defaultValue: '62' },
                    { code: 'draw_24_26', label: 'Draw Length 24-26 inch = Bow Height 64-66"', type: 'TEXT', defaultValue: '64-66' },
                    { code: 'draw_26_28', label: 'Draw Length 26-28 inch = Bow Height 66-68"', type: 'TEXT', defaultValue: '66-68' },
                    { code: 'draw_28_30', label: 'Draw Length 28-30 inch = Bow Height 68-70"', type: 'TEXT', defaultValue: '68-70' },
                    { code: 'draw_30_plus', label: 'Draw Length >30 inch = Bow Height 70-72"', type: 'TEXT', defaultValue: '70-72' }
                ]
            },
            {
                code: 'arrow_recommendation_recurve',
                name: 'Arrow Recommendation (Barebow, Nasional, Recurve)',
                options: [
                    { code: 'weight_18_22', label: '18-22 lbs = Spine 1000-900', type: 'TEXT', defaultValue: '1000-900' },
                    { code: 'weight_22_26', label: '22-26 lbs = Spine 900-800', type: 'TEXT', defaultValue: '900-800' },
                    { code: 'weight_26_30', label: '26-30 lbs = Spine 800-700', type: 'TEXT', defaultValue: '800-700' },
                    { code: 'weight_30_34', label: '30-34 lbs = Spine 700-600', type: 'TEXT', defaultValue: '700-600' },
                    { code: 'weight_34_38', label: '34-38 lbs = Spine 600-500', type: 'TEXT', defaultValue: '600-500' },
                    { code: 'weight_38_42', label: '38-42 lbs = Spine 500-450', type: 'TEXT', defaultValue: '500-450' },
                    { code: 'weight_42_46', label: '42-46 lbs = Spine 450-400', type: 'TEXT', defaultValue: '450-400' }
                ]
            },
            {
                code: 'arrow_recommendation_compound',
                name: 'Arrow Recommendation (Compound)',
                options: [
                    { code: 'compound_30_40', label: '30-40 lbs = Spine 600', type: 'TEXT', defaultValue: '600' },
                    { code: 'compound_40_50', label: '40-50 lbs = Spine 500', type: 'TEXT', defaultValue: '500' },
                    { code: 'compound_50_60', label: '50-60 lbs = Spine 400', type: 'TEXT', defaultValue: '400' },
                    { code: 'compound_60_70', label: '60-70 lbs = Spine 350', type: 'TEXT', defaultValue: '350' },
                    { code: 'compound_70_plus', label: '70+ lbs = Spine 300', type: 'TEXT', defaultValue: '300' }
                ]
            },
            {
                code: 'brace_height_ref',
                name: 'Brace Height Recommendation',
                options: [
                    { code: 'bow_66', label: 'Bow 66 inch = 22.0-22.50 cm', type: 'TEXT', defaultValue: '22.0-22.50' },
                    { code: 'bow_68', label: 'Bow 68 inch = 22.50-23.00 cm', type: 'TEXT', defaultValue: '22.50-23.00' },
                    { code: 'bow_70', label: 'Bow 70 inch = 23.00-23.5 cm', type: 'TEXT', defaultValue: '23.00-23.5' }
                ]
            },
            {
                code: 'nocking_point_ref',
                name: 'Nocking Point Recommendation',
                options: [
                    { code: 'recurve_nocking', label: 'Recurve: 8-12 mm', type: 'TEXT', defaultValue: '8-12' },
                    { code: 'compound_nocking', label: 'Compound: 0-3 mm', type: 'TEXT', defaultValue: '0-3' },
                    { code: 'barebow_nocking', label: 'Barebow: 4-6 mm', type: 'TEXT', defaultValue: '4-6' }
                ]
            }
        ]
    }
];

async function main() {
    console.log('🌱 Seeding Module Lego Blocks...');

    for (const mod of MODULES_DATA) {
        // 1. Upsert Module
        const moduleRecord = await prisma.module.upsert({
            where: { code: mod.code },
            update: {
                name: mod.name,
                category: mod.category,
                description: mod.description,
                moduleType: mod.moduleType || 'UNIVERSAL',
                targetRoles: mod.targetRoles ? JSON.stringify(mod.targetRoles) : null
            },
            create: {
                code: mod.code,
                name: mod.name,
                category: mod.category,
                description: mod.description,
                moduleType: mod.moduleType || 'UNIVERSAL',
                targetRoles: mod.targetRoles ? JSON.stringify(mod.targetRoles) : null
            }
        });

        console.log(`   📦 Module: ${moduleRecord.name}`);

        // 2. Upsert SubModules
        if (mod.subModules) {
            for (const sub of mod.subModules) {
                const subRecord = await prisma.subModule.upsert({
                    where: {
                        moduleId_code: {
                            moduleId: moduleRecord.id,
                            code: sub.code
                        }
                    },
                    update: { name: sub.name },
                    create: {
                        moduleId: moduleRecord.id,
                        code: sub.code,
                        name: sub.name
                    }
                });

                // 3. Upsert Options (if any)
                if ('options' in sub && sub.options) {
                    for (const opt of sub.options) {
                        await prisma.moduleOption.upsert({
                            where: {
                                subModuleId_code: {
                                    subModuleId: subRecord.id,
                                    code: opt.code
                                }
                            },
                            update: {
                                label: opt.label,
                                type: opt.type,
                                defaultValue: opt.defaultValue
                            },
                            create: {
                                subModuleId: subRecord.id,
                                code: opt.code,
                                label: opt.label,
                                type: opt.type,
                                defaultValue: opt.defaultValue
                            }
                        });
                    }
                }
            }
        }
    }

    console.log('✅ Module Seeding Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
