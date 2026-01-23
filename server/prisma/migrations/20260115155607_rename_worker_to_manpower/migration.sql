/*
  Warnings:

  - You are about to drop the `jersey_workers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `worker_tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "jersey_workers_supplier_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "worker_tasks_status_idx";

-- DropIndex
DROP INDEX IF EXISTS "worker_tasks_order_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "worker_tasks_worker_id_idx";

-- DropTable
DROP TABLE IF EXISTS "jersey_workers" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "worker_tasks" CASCADE;

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rpe" INTEGER NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "arrow_count" INTEGER NOT NULL DEFAULT 0,
    "sleep_quality" INTEGER,
    "fatigue_level" INTEGER,
    "stress_level" INTEGER,
    "soreness_level" INTEGER,
    "notes" TEXT,
    "resting_hr" INTEGER,
    "hrv" INTEGER,
    "vo2_max" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "athlete_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athlete_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "manpower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "specialization" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "daily_capacity" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "manpower_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manpower_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "estimated_minutes" INTEGER,
    "actual_minutes" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- RedefineTables
CREATE TABLE "new_athletes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "club_id" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT,
    "archery_category" TEXT NOT NULL,
    "division" TEXT,
    "skill_level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "under_age_category" TEXT,
    "dominant_hand" TEXT,
    "dominant_eye" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "arm_span" DOUBLE PRECISION,
    "draw_length" DOUBLE PRECISION,
    "bow_brand" TEXT,
    "bow_model" TEXT,
    "bow_draw_weight" DOUBLE PRECISION,
    "arrow_brand" TEXT,
    "arrow_spine" TEXT,
    "athlete_id_number" TEXT,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "medical_notes" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
INSERT INTO "new_athletes" ("archery_category", "arm_span", "arrow_brand", "arrow_spine", "athlete_id_number", "bow_brand", "bow_draw_weight", "bow_model", "club_id", "created_at", "date_of_birth", "division", "dominant_eye", "dominant_hand", "draw_length", "emergency_contact", "emergency_phone", "gender", "height", "id", "medical_notes", "nationality", "parent_id", "registration_date", "skill_level", "under_age_category", "updated_at", "user_id", "weight") SELECT "archery_category", "arm_span", "arrow_brand", "arrow_spine", "athlete_id_number", "bow_brand", "bow_draw_weight", "bow_model", "club_id", "created_at", "date_of_birth", "division", "dominant_eye", "dominant_hand", "draw_length", "emergency_contact", "emergency_phone", "gender", "height", "id", "medical_notes", "nationality", "parent_id", "registration_date", "skill_level", "under_age_category", "updated_at", "user_id", "weight" FROM "athletes";
DROP TABLE "athletes" CASCADE;
ALTER TABLE "new_athletes" RENAME TO "athletes";
CREATE UNIQUE INDEX "athletes_user_id_key" ON "athletes"("user_id");
CREATE UNIQUE INDEX "athletes_athlete_id_number_key" ON "athletes"("athlete_id_number");
CREATE INDEX "athletes_club_id_idx" ON "athletes"("club_id");
CREATE INDEX "athletes_parent_id_idx" ON "athletes"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "athlete_badges_athlete_id_idx" ON "athlete_badges"("athlete_id");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_badges_athlete_id_badge_id_key" ON "athlete_badges"("athlete_id", "badge_id");

-- CreateIndex
CREATE INDEX "manpower_supplier_id_idx" ON "manpower"("supplier_id");

-- CreateIndex
CREATE INDEX "manpower_tasks_manpower_id_idx" ON "manpower_tasks"("manpower_id");

-- CreateIndex
CREATE INDEX "manpower_tasks_order_id_idx" ON "manpower_tasks"("order_id");

-- CreateIndex
CREATE INDEX "manpower_tasks_status_idx" ON "manpower_tasks"("status");

-- Foreign Key Constraints
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_badges" ADD CONSTRAINT "athlete_badges_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_badges" ADD CONSTRAINT "athlete_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manpower_tasks" ADD CONSTRAINT "manpower_tasks_manpower_id_fkey" FOREIGN KEY ("manpower_id") REFERENCES "manpower"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manpower_tasks" ADD CONSTRAINT "manpower_tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;