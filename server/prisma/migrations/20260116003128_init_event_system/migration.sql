-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eo_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "competition_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competition_id" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "ageClass" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "quota" INTEGER NOT NULL DEFAULT 0,
    "fee" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "competition_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competition_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_proof" TEXT,
    "qualification_score" INTEGER,
    "rank" INTEGER
);

-- RedefineTables
CREATE TABLE "new_athletes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "club_id" TEXT,
    "date_of_birth" TIMESTAMP NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT,
    "archery_category" TEXT NOT NULL,
    "division" TEXT,
    "skill_level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "under_age_category" TEXT,
    "dominant_hand" TEXT,
    "dominant_eye" TEXT,
    "height" REAL,
    "weight" REAL,
    "arm_span" REAL,
    "draw_length" REAL,
    "bow_brand" TEXT,
    "bow_model" TEXT,
    "bow_draw_weight" REAL,
    "arrow_brand" TEXT,
    "arrow_spine" TEXT,
    "athlete_id_number" TEXT,
    "registration_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "medical_notes" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);
INSERT INTO "new_athletes" ("archery_category", "arm_span", "arrow_brand", "arrow_spine", "athlete_id_number", "bow_brand", "bow_draw_weight", "bow_model", "club_id", "created_at", "date_of_birth", "division", "dominant_eye", "dominant_hand", "draw_length", "emergency_contact", "emergency_phone", "gender", "height", "id", "level", "medical_notes", "nationality", "parent_id", "registration_date", "skill_level", "under_age_category", "updated_at", "user_id", "weight", "xp") SELECT "archery_category", "arm_span", "arrow_brand", "arrow_spine", "athlete_id_number", "bow_brand", "bow_draw_weight", "bow_model", "club_id", "created_at", "date_of_birth", "division", "dominant_eye", "dominant_hand", "draw_length", "emergency_contact", "emergency_phone", "gender", "height", "id", "level", "medical_notes", "nationality", "parent_id", "registration_date", "skill_level", "under_age_category", "updated_at", "user_id", "weight", "xp" FROM "athletes";
DROP TABLE "athletes";
ALTER TABLE "new_athletes" RENAME TO "athletes";
CREATE UNIQUE INDEX "athletes_user_id_key" ON "athletes"("user_id");
CREATE UNIQUE INDEX "athletes_athlete_id_number_key" ON "athletes"("athlete_id_number");
CREATE INDEX "athletes_club_id_idx" ON "athletes"("club_id");
CREATE INDEX "athletes_parent_id_idx" ON "athletes"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_slug_key" ON "competitions"("slug");

-- CreateIndex
CREATE INDEX "competitions_eo_id_idx" ON "competitions"("eo_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_registrations_category_id_athlete_id_key" ON "competition_registrations"("category_id", "athlete_id");


-- Foreign Key Constraints
ALTER TABLE "competition_categories" ADD CONSTRAINT "competition_categories_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competition_registrations" ADD CONSTRAINT "competition_registrations_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "competition_registrations" ADD CONSTRAINT "competition_registrations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "competition_categories"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "competition_registrations" ADD CONSTRAINT "competition_registrations_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "new_athletes" ADD CONSTRAINT "athletes_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE SET NULL ON UPDATE CASCADE;