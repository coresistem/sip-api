-- CreateTable
CREATE TABLE IF NOT EXISTS "sidebar_role_configs" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "groups" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidebar_role_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "competition_sessions" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "session_number" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "target_allocations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "target_start" INTEGER NOT NULL,
    "target_end" INTEGER NOT NULL,
    "archers_per_target" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "competition_schedules" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "day_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "competition_budget_entries" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "tag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "competition_timeline_items" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pic" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_timeline_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "certificates" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_id" TEXT,
    "category" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "rank" INTEGER,
    "total_score" INTEGER,
    "validation_code" TEXT NOT NULL,
    "validation_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "template_type" TEXT NOT NULL DEFAULT 'DEFAULT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "role_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "requested_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nik" TEXT,
    "nik_document_url" TEXT,
    "cert_document_url" TEXT,
    "generated_sip_id" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "troubleshoots" (
    "id" TEXT NOT NULL,
    "ts_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "root_cause" TEXT NOT NULL,
    "debug_steps" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "prevention" TEXT,
    "related_files" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "troubleshoots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sidebar_role_configs_role_key" ON "sidebar_role_configs"("role");

-- CreateIndex
CREATE INDEX "competition_sessions_competition_id_idx" ON "competition_sessions"("competition_id");

-- CreateIndex
CREATE INDEX "target_allocations_session_id_idx" ON "target_allocations"("session_id");

-- CreateIndex
CREATE INDEX "target_allocations_category_id_idx" ON "target_allocations"("category_id");

-- CreateIndex
CREATE INDEX "competition_schedules_competition_id_idx" ON "competition_schedules"("competition_id");

-- CreateIndex
CREATE INDEX "competition_schedules_start_time_idx" ON "competition_schedules"("start_time");

-- CreateIndex
CREATE INDEX "competition_budget_entries_competition_id_idx" ON "competition_budget_entries"("competition_id");

-- CreateIndex
CREATE INDEX "competition_timeline_items_competition_id_idx" ON "competition_timeline_items"("competition_id");

-- CreateIndex
CREATE INDEX "certificates_competition_id_idx" ON "certificates"("competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_validation_code_key" ON "certificates"("validation_code");

-- CreateIndex
CREATE INDEX "certificates_validation_code_idx" ON "certificates"("validation_code");

-- CreateIndex
CREATE INDEX "role_requests_user_id_idx" ON "role_requests"("user_id");

-- CreateIndex
CREATE INDEX "role_requests_status_idx" ON "role_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "troubleshoots_ts_id_key" ON "troubleshoots"("ts_id");

-- CreateIndex
CREATE INDEX "troubleshoots_category_idx" ON "troubleshoots"("category");

-- CreateIndex
CREATE INDEX "troubleshoots_severity_idx" ON "troubleshoots"("severity");

-- AddForeignKey
ALTER TABLE "competition_sessions" ADD CONSTRAINT "competition_sessions_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_allocations" ADD CONSTRAINT "target_allocations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_allocations" ADD CONSTRAINT "target_allocations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "competition_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_schedules" ADD CONSTRAINT "competition_schedules_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_budget_entries" ADD CONSTRAINT "competition_budget_entries_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_timeline_items" ADD CONSTRAINT "competition_timeline_items_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "athletes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_requests" ADD CONSTRAINT "role_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
