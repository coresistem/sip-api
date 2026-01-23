import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🛠 Starting Schema Repair & Recovery...');

    const queries = [
        // --- Migration 0: Missing Tables ---
        `CREATE TABLE IF NOT EXISTS "sidebar_role_configs" ( "id" TEXT PRIMARY KEY, "role" TEXT UNIQUE NOT NULL, "groups" TEXT NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "competition_sessions" ( "id" TEXT PRIMARY KEY, "competition_id" TEXT NOT NULL, "session_number" INTEGER NOT NULL, "start_time" TIMESTAMP(3) NOT NULL, "end_time" TIMESTAMP(3), "name" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "target_allocations" ( "id" TEXT PRIMARY KEY, "session_id" TEXT NOT NULL, "category_id" TEXT NOT NULL, "target_start" INTEGER NOT NULL, "target_end" INTEGER NOT NULL, "archers_per_target" INTEGER NOT NULL DEFAULT 4, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "competition_schedules" ( "id" TEXT PRIMARY KEY, "competition_id" TEXT NOT NULL, "day_date" TIMESTAMP(3) NOT NULL, "start_time" TIMESTAMP(3) NOT NULL, "end_time" TIMESTAMP(3) NOT NULL, "activity" TEXT NOT NULL, "category" TEXT, "notes" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "competition_budget_entries" ( "id" TEXT PRIMARY KEY, "competition_id" TEXT NOT NULL, "category" TEXT NOT NULL, "description" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "tag" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "competition_timeline_items" ( "id" TEXT PRIMARY KEY, "competition_id" TEXT NOT NULL, "title" TEXT NOT NULL, "pic" TEXT, "start_date" TIMESTAMP(3) NOT NULL, "end_date" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "certificates" ( "id" TEXT PRIMARY KEY, "competition_id" TEXT NOT NULL, "recipient_name" TEXT NOT NULL, "recipient_id" TEXT, "category" TEXT NOT NULL, "achievement" TEXT NOT NULL, "rank" INTEGER, "total_score" INTEGER, "validation_code" TEXT UNIQUE NOT NULL, "validation_url" TEXT, "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "download_count" INTEGER NOT NULL DEFAULT 0, "template_type" TEXT NOT NULL DEFAULT 'DEFAULT', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "role_requests" ( "id" TEXT PRIMARY KEY, "user_id" TEXT NOT NULL, "requested_role" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "nik" TEXT, "nik_document_url" TEXT, "cert_document_url" TEXT, "generated_sip_id" TEXT, "reviewed_by" TEXT, "reviewed_at" TIMESTAMP(3), "rejection_reason" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "troubleshoots" ( "id" TEXT PRIMARY KEY, "ts_id" TEXT UNIQUE NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL, "severity" TEXT NOT NULL, "effort" TEXT NOT NULL, "symptoms" TEXT NOT NULL, "root_cause" TEXT NOT NULL, "debug_steps" TEXT NOT NULL, "solution" TEXT NOT NULL, "prevention" TEXT, "related_files" TEXT, "created_by" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,

        // --- Migration 1: Auth Tables ---
        `CREATE TABLE IF NOT EXISTS "refresh_tokens" ( "id" TEXT PRIMARY KEY, "token" TEXT UNIQUE NOT NULL, "user_id" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP );`,
        `CREATE TABLE IF NOT EXISTS "notifications" ( "id" TEXT PRIMARY KEY, "user_id" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" TEXT NOT NULL, "link" TEXT, "is_read" BOOLEAN NOT NULL DEFAULT false, "read_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP );`,
        `CREATE TABLE IF NOT EXISTS "audit_logs" ( "id" TEXT PRIMARY KEY, "user_id" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entity_id" TEXT, "old_values" TEXT, "new_values" TEXT, "ip_address" TEXT, "user_agent" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP );`,
        `CREATE TABLE IF NOT EXISTS "documents" ( "id" TEXT PRIMARY KEY, "club_id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "category" TEXT NOT NULL, "file_url" TEXT NOT NULL, "file_type" TEXT NOT NULL, "file_size" INTEGER NOT NULL, "uploaded_by" TEXT NOT NULL, "is_public" BOOLEAN NOT NULL DEFAULT false, "expiry_date" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,

        // --- Migration 2: Core Tables ---
        `CREATE TABLE IF NOT EXISTS "daily_logs" ( "id" TEXT PRIMARY KEY, "user_id" TEXT NOT NULL, "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "rpe" INTEGER NOT NULL, "duration_minutes" INTEGER NOT NULL, "arrow_count" INTEGER NOT NULL DEFAULT 0, "sleep_quality" INTEGER, "fatigue_level" INTEGER, "stress_level" INTEGER, "soreness_level" INTEGER, "notes" TEXT, "resting_hr" INTEGER, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "training_schedules" ( "id" TEXT PRIMARY KEY, "club_id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "start_time" TIMESTAMP(3) NOT NULL, "end_time" TIMESTAMP(3) NOT NULL, "venue" TEXT, "max_participants" INTEGER, "target_category" TEXT, "target_skill_level" TEXT, "status" TEXT NOT NULL DEFAULT 'SCHEDULED', "is_recurring" BOOLEAN NOT NULL DEFAULT false, "recurring_pattern" TEXT, "notes" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "schedule_participants" ( "id" TEXT PRIMARY KEY, "schedule_id" TEXT NOT NULL, "athlete_id" TEXT NOT NULL, "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP );`,
        `CREATE TABLE IF NOT EXISTS "scoring_records" ( "id" TEXT PRIMARY KEY, "athlete_id" TEXT NOT NULL, "coach_id" TEXT, "schedule_id" TEXT, "session_date" TIMESTAMP(3) NOT NULL, "session_type" TEXT NOT NULL DEFAULT 'TRAINING', "distance" INTEGER NOT NULL, "target_face" TEXT, "arrow_scores" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "attendances" ( "id" TEXT PRIMARY KEY, "user_id" TEXT NOT NULL, "schedule_id" TEXT NOT NULL, "check_in_time" TIMESTAMP(3) NOT NULL, "check_out_time" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'PRESENT', "method" TEXT NOT NULL DEFAULT 'QR_SCAN', "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "location_accuracy" DOUBLE PRECISION, "notes" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL );`,

        // --- Cleanup Migration History (Optional but helpful to avoid P3009) ---
        `DELETE FROM "_prisma_migrations" WHERE "migration_name" IN ('20260124000000_add_missing_tables', '20260124000001_add_auth_tables', '20260124000002_add_core_tables') AND "finished_at" IS NULL;`
    ];

    for (const q of queries) {
        try {
            console.log(`Executing: ${q.substring(0, 50)}...`);
            await prisma.$executeRawUnsafe(q);
        } catch (e) {
            console.warn(`⚠️ Query failed (could be harmless if table exists):`, (e as Error).message);
        }
    }

    // 2. Seed Super Admin
    const saEmail = 'admin@sip.id';
    const saPassword = await bcrypt.hash('superadmin123', 12);
    console.log(`Setting up Super Admin: ${saEmail}...`);
    try {
        await prisma.user.upsert({
            where: { email: saEmail },
            update: { passwordHash: saPassword },
            create: {
                email: saEmail,
                passwordHash: saPassword,
                name: 'Super Administrator',
                role: 'SUPER_ADMIN',
                phone: '+62812000000',
                sipId: '00.0000.0001'
            }
        });
        console.log('✓ Super Admin ready.');
    } catch (e) {
        console.error('❌ Failed to upsert Super Admin:', e);
    }

    // 3. Seed Sidebar Config
    console.log('Setting up Sidebar Configuration...');
    const defaultGroups = [
        { id: 'general', label: 'General', icon: 'LayoutDashboard', color: 'primary', modules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'my_orders', 'catalog'] },
        { id: 'athlete', label: 'Athlete', icon: 'Target', color: 'blue', modules: ['scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history'] },
        { id: 'coach', label: 'Coach', icon: 'Users', color: 'green', modules: ['coach_analytics', 'score_validation', 'athletes', 'schedules', 'attendance'] },
        { id: 'club', label: 'Club', icon: 'Building2', color: 'orange', modules: ['organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports'] },
        { id: 'school', label: 'School', icon: 'GraduationCap', color: 'emerald', modules: ['schools', 'o2sn_registration'] },
        { id: 'parent', label: 'Parent', icon: 'Heart', color: 'purple', modules: ['payments'] },
        { id: 'eo', label: 'Event Organizer', icon: 'Calendar', color: 'teal', modules: ['events', 'event_creation', 'event_registration', 'event_results'] },
        { id: 'judge', label: 'Judge', icon: 'Scale', color: 'indigo', modules: ['score_validation'] },
        { id: 'supplier', label: 'Supplier', icon: 'Package', color: 'rose', modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'jersey_staff', 'inventory'] },
        { id: 'admin', label: 'Admin', icon: 'Settings', color: 'red', modules: ['admin', 'audit_logs'] }
    ];

    try {
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'SUPER_ADMIN' },
            update: { groups: JSON.stringify(defaultGroups) },
            create: {
                role: 'SUPER_ADMIN',
                groups: JSON.stringify(defaultGroups),
                updatedAt: new Date()
            }
        });
        console.log('✓ Sidebar Config ready.');
    } catch (e) {
        console.error('❌ Failed to upsert Sidebar Config:', e);
    }

    console.log('✅ Repair & Recovery complete!');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
