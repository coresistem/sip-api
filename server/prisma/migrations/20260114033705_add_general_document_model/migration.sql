-- CreateTable
CREATE TABLE "general_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sip_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_by_id" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "expiry_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "system_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "component_path" TEXT NOT NULL,
    "props_schema" TEXT,
    "data_source" TEXT,
    "required_perms" TEXT,
    "dependencies" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "feature_assemblies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_role" TEXT NOT NULL,
    "target_page" TEXT,
    "route" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP,
    "deployed_at" TIMESTAMP,
    "preview_config" TEXT,
    "test_notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "feature_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feature_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'main',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "props_config" TEXT,
    "data_binding" TEXT,
    "show_condition" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_parts_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature_assemblies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feature_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "system_parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "club_join_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "club_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "club_join_requests_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
CREATE TABLE "new_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "module_type" TEXT NOT NULL DEFAULT 'UNIVERSAL',
    "target_roles" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);
INSERT INTO "new_modules" ("category", "code", "created_at", "description", "id", "name", "updated_at") SELECT "category", "code", "created_at", "description", "id", "name", "updated_at" FROM "modules";
DROP TABLE "modules";
ALTER TABLE "new_modules" RENAME TO "modules";
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");
CREATE TABLE "new_scoring_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athlete_id" TEXT NOT NULL,
    "coach_id" TEXT,
    "schedule_id" TEXT,
    "session_date" TIMESTAMP NOT NULL,
    "session_type" TEXT NOT NULL DEFAULT 'TRAINING',
    "distance" INTEGER NOT NULL,
    "target_face" TEXT,
    "arrow_scores" TEXT NOT NULL,
    "total_sum" INTEGER NOT NULL,
    "arrow_count" INTEGER NOT NULL,
    "average" REAL NOT NULL DEFAULT 0,
    "tens_count" INTEGER NOT NULL DEFAULT 0,
    "x_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "weather_condition" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "scoring_records_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scoring_records_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "scoring_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_scoring_records" ("arrow_count", "arrow_scores", "athlete_id", "average", "coach_id", "created_at", "distance", "id", "is_verified", "notes", "schedule_id", "session_date", "session_type", "target_face", "tens_count", "total_sum", "updated_at", "weather_condition", "x_count") SELECT "arrow_count", "arrow_scores", "athlete_id", "average", "coach_id", "created_at", "distance", "id", "is_verified", "notes", "schedule_id", "session_date", "session_type", "target_face", "tens_count", "total_sum", "updated_at", "weather_condition", "x_count" FROM "scoring_records";
DROP TABLE "scoring_records";
ALTER TABLE "new_scoring_records" RENAME TO "scoring_records";
CREATE INDEX "scoring_records_athlete_id_idx" ON "scoring_records"("athlete_id");
CREATE INDEX "scoring_records_coach_id_idx" ON "scoring_records"("coach_id");
CREATE INDEX "scoring_records_session_date_idx" ON "scoring_records"("session_date");

-- CreateIndex
CREATE INDEX "general_documents_sip_id_idx" ON "general_documents"("sip_id");

-- CreateIndex
CREATE INDEX "general_documents_category_idx" ON "general_documents"("category");

-- CreateIndex
CREATE UNIQUE INDEX "system_parts_code_key" ON "system_parts"("code");

-- CreateIndex
CREATE INDEX "system_parts_type_idx" ON "system_parts"("type");

-- CreateIndex
CREATE INDEX "system_parts_category_idx" ON "system_parts"("category");

-- CreateIndex
CREATE INDEX "system_parts_status_idx" ON "system_parts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "feature_assemblies_code_key" ON "feature_assemblies"("code");

-- CreateIndex
CREATE INDEX "feature_assemblies_target_role_idx" ON "feature_assemblies"("target_role");

-- CreateIndex
CREATE INDEX "feature_assemblies_status_idx" ON "feature_assemblies"("status");

-- CreateIndex
CREATE INDEX "feature_assemblies_created_by_idx" ON "feature_assemblies"("created_by");

-- CreateIndex
CREATE INDEX "feature_parts_feature_id_idx" ON "feature_parts"("feature_id");

-- CreateIndex
CREATE INDEX "feature_parts_part_id_idx" ON "feature_parts"("part_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_parts_feature_id_part_id_section_key" ON "feature_parts"("feature_id", "part_id", "section");

-- CreateIndex
CREATE INDEX "club_join_requests_club_id_idx" ON "club_join_requests"("club_id");

-- CreateIndex
CREATE INDEX "club_join_requests_user_id_idx" ON "club_join_requests"("user_id");

-- CreateIndex
CREATE INDEX "club_join_requests_status_idx" ON "club_join_requests"("status");
