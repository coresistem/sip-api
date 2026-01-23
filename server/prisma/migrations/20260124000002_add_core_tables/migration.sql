-- CreateTable: daily_logs
CREATE TABLE IF NOT EXISTS "daily_logs" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: training_schedules
CREATE TABLE IF NOT EXISTS "training_schedules" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "max_participants" INTEGER,
    "target_category" TEXT,
    "target_skill_level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: schedule_participants
CREATE TABLE IF NOT EXISTS "schedule_participants" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: scoring_records
CREATE TABLE IF NOT EXISTS "scoring_records" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "coach_id" TEXT,
    "schedule_id" TEXT,
    "session_date" TIMESTAMP(3) NOT NULL,
    "session_type" TEXT NOT NULL DEFAULT 'TRAINING',
    "distance" INTEGER NOT NULL,
    "target_face" TEXT,
    "arrow_scores" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable: attendances
CREATE TABLE IF NOT EXISTS "attendances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3) NOT NULL,
    "check_out_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "method" TEXT NOT NULL DEFAULT 'QR_SCAN',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location_accuracy" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_user_id_date_key" ON "daily_logs"("user_id", "date");
CREATE INDEX "daily_logs_user_id_idx" ON "daily_logs"("user_id");
CREATE INDEX "training_schedules_club_id_idx" ON "training_schedules"("club_id");
CREATE INDEX "training_schedules_start_time_idx" ON "training_schedules"("start_time");
CREATE UNIQUE INDEX "schedule_participants_schedule_id_athlete_id_key" ON "schedule_participants"("schedule_id", "athlete_id");
CREATE INDEX "scoring_records_athlete_id_idx" ON "scoring_records"("athlete_id");
CREATE INDEX "scoring_records_coach_id_idx" ON "scoring_records"("coach_id");
CREATE INDEX "attendances_user_id_idx" ON "attendances"("user_id");
CREATE INDEX "attendances_schedule_id_idx" ON "attendances"("schedule_id");

-- AddForeignKeys
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
