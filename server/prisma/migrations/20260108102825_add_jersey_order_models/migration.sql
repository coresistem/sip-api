-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ATHLETE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "sip_id" TEXT,
    "whatsapp" TEXT,
    "province_id" TEXT,
    "city_id" TEXT,
    "nik" TEXT,
    "nik_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_student" BOOLEAN NOT NULL DEFAULT false,
    "club_id" TEXT
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sip_id" TEXT,
    "name" TEXT NOT NULL,
    "registration_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "whatsapp_hotline" TEXT,
    "instagram" TEXT,
    "is_perpani_member" BOOLEAN NOT NULL DEFAULT false,
    "sk_perpani_no" TEXT,
    "sk_perpani_doc_id" TEXT,
    "perpani_id" TEXT,
    "owner_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "club_id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "scoring_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athlete_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
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
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "membership_fees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athlete_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "billing_period" TEXT NOT NULL,
    "due_date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_proof_url" TEXT,
    "transaction_date" TIMESTAMP,
    "payment_method" TEXT,
    "transaction_ref" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP,
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "training_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "venue" TEXT,
    "max_participants" INTEGER,
    "target_category" TEXT,
    "target_skill_level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "schedule_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "registered_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "asset_inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "condition_notes" TEXT,
    "purchase_date" TIMESTAMP,
    "purchase_price" REAL,
    "supplier" TEXT,
    "warranty_expiry" TIMESTAMP,
    "last_maintenance_date" TIMESTAMP,
    "next_maintenance_date" TIMESTAMP,
    "maintenance_cycle" INTEGER,
    "storage_location" TEXT,
    "assigned_to" TEXT,
    "image_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "asset_maintenance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "maintenance_date" TIMESTAMP NOT NULL,
    "description" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "cost" REAL,
    "condition_before" TEXT NOT NULL,
    "condition_after" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "check_in_time" TIMESTAMP NOT NULL,
    "check_out_time" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "method" TEXT NOT NULL DEFAULT 'QR_SCAN',
    "latitude" REAL,
    "longitude" REAL,
    "location_accuracy" REAL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "expiry_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "equipment_config_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "arrows_per_end" INTEGER NOT NULL,
    "division" TEXT,
    "target_face" TEXT,
    "distance" INTEGER,
    "draw_length" REAL NOT NULL,
    "draw_weight" REAL NOT NULL,
    "bow_height" TEXT,
    "brace_height" REAL,
    "a_tiller" REAL,
    "b_tiller" REAL,
    "diff_tiller" REAL,
    "tiller_status" TEXT,
    "nocking_point" REAL,
    "nocking_status" TEXT,
    "arrow_point" REAL,
    "arrow_length" REAL,
    "avg_score_arrow" REAL,
    "total_score" INTEGER,
    "total_arrows" INTEGER,
    "index_arrow_score" REAL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "perpani" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sip_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NO_OPERATOR',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sip_id" TEXT NOT NULL,
    "npsn" TEXT,
    "name" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "source_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NO_OPERATOR',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "nisn" TEXT,
    "current_class" TEXT,
    "join_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leave_date" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "club_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "custom_title" TEXT,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "term_start" TIMESTAMP,
    "term_end" TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "history_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "log_type" TEXT NOT NULL,
    "from_id" TEXT,
    "from_name" TEXT,
    "from_city" TEXT,
    "to_id" TEXT,
    "to_name" TEXT,
    "to_city" TEXT,
    "year" INTEGER,
    "level" TEXT,
    "achievement" TEXT,
    "division" TEXT,
    "distance" TEXT,
    "event_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "custom_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sip_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "allowed_roles" TEXT,
    "show_in_menu" BOOLEAN NOT NULL DEFAULT true,
    "menu_category" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "module_fields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "module_id" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "min_value" REAL,
    "max_value" REAL,
    "options" TEXT,
    "is_scored" BOOLEAN NOT NULL DEFAULT true,
    "max_score" INTEGER NOT NULL DEFAULT 1,
    "feedback_good" TEXT,
    "feedback_bad" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "help_text" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "assessment_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessment_no" TEXT,
    "module_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "assessed_by" TEXT NOT NULL,
    "field_values" TEXT NOT NULL,
    "section_scores" TEXT,
    "total_score" REAL,
    "ai_feedback" TEXT,
    "coach_notes" TEXT,
    "assessment_type" TEXT NOT NULL DEFAULT 'POST_TEST',
    "coach_signature" TEXT,
    "assessment_date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "jersey_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "design_url" TEXT,
    "design_thumbnail" TEXT,
    "base_price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_order_qty" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_modifier" REAL NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "jersey_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_no" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "club_id" TEXT,
    "order_type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "supplier_id" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "addons_total" REAL NOT NULL DEFAULT 0,
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_status" TEXT NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "shipping_address" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "athlete_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "base_price" REAL NOT NULL,
    "selected_variants" TEXT,
    "variant_prices" REAL NOT NULL DEFAULT 0,
    "line_total" REAL NOT NULL,
    "name_on_jersey" TEXT,
    "number_on_jersey" TEXT
);

-- CreateTable
CREATE TABLE "order_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_sip_id_key" ON "users"("sip_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_club_id_idx" ON "users"("club_id");

-- CreateIndex
CREATE INDEX "users_sip_id_idx" ON "users"("sip_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_sip_id_key" ON "clubs"("sip_id");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_registration_number_key" ON "clubs"("registration_number");

-- CreateIndex
CREATE INDEX "clubs_owner_id_idx" ON "clubs"("owner_id");

-- CreateIndex
CREATE INDEX "clubs_perpani_id_idx" ON "clubs"("perpani_id");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_user_id_key" ON "athletes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_athlete_id_number_key" ON "athletes"("athlete_id_number");

-- CreateIndex
CREATE INDEX "athletes_club_id_idx" ON "athletes"("club_id");

-- CreateIndex
CREATE INDEX "athletes_parent_id_idx" ON "athletes"("parent_id");

-- CreateIndex
CREATE INDEX "scoring_records_athlete_id_idx" ON "scoring_records"("athlete_id");

-- CreateIndex
CREATE INDEX "scoring_records_coach_id_idx" ON "scoring_records"("coach_id");

-- CreateIndex
CREATE INDEX "scoring_records_session_date_idx" ON "scoring_records"("session_date");

-- CreateIndex
CREATE INDEX "membership_fees_athlete_id_idx" ON "membership_fees"("athlete_id");

-- CreateIndex
CREATE INDEX "membership_fees_status_idx" ON "membership_fees"("status");

-- CreateIndex
CREATE INDEX "membership_fees_billing_period_idx" ON "membership_fees"("billing_period");

-- CreateIndex
CREATE INDEX "training_schedules_club_id_idx" ON "training_schedules"("club_id");

-- CreateIndex
CREATE INDEX "training_schedules_start_time_idx" ON "training_schedules"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_participants_schedule_id_athlete_id_key" ON "schedule_participants"("schedule_id", "athlete_id");

-- CreateIndex
CREATE INDEX "asset_inventory_club_id_idx" ON "asset_inventory"("club_id");

-- CreateIndex
CREATE INDEX "asset_inventory_status_idx" ON "asset_inventory"("status");

-- CreateIndex
CREATE INDEX "asset_maintenance_logs_asset_id_idx" ON "asset_maintenance_logs"("asset_id");

-- CreateIndex
CREATE INDEX "attendances_user_id_idx" ON "attendances"("user_id");

-- CreateIndex
CREATE INDEX "attendances_schedule_id_idx" ON "attendances"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_user_id_schedule_id_key" ON "attendances"("user_id", "schedule_id");

-- CreateIndex
CREATE INDEX "documents_club_id_idx" ON "documents"("club_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "equipment_config_logs_user_id_idx" ON "equipment_config_logs"("user_id");

-- CreateIndex
CREATE INDEX "equipment_config_logs_created_at_idx" ON "equipment_config_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "perpani_sip_id_key" ON "perpani"("sip_id");

-- CreateIndex
CREATE INDEX "perpani_province_id_idx" ON "perpani"("province_id");

-- CreateIndex
CREATE INDEX "perpani_city_id_idx" ON "perpani"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "schools_sip_id_key" ON "schools"("sip_id");

-- CreateIndex
CREATE UNIQUE INDEX "schools_npsn_key" ON "schools"("npsn");

-- CreateIndex
CREATE INDEX "schools_province_id_idx" ON "schools"("province_id");

-- CreateIndex
CREATE INDEX "schools_city_id_idx" ON "schools"("city_id");

-- CreateIndex
CREATE INDEX "schools_npsn_idx" ON "schools"("npsn");

-- CreateIndex
CREATE INDEX "student_enrollments_user_id_idx" ON "student_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "student_enrollments_school_id_idx" ON "student_enrollments"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_user_id_school_id_key" ON "student_enrollments"("user_id", "school_id");

-- CreateIndex
CREATE INDEX "club_organizations_club_id_idx" ON "club_organizations"("club_id");

-- CreateIndex
CREATE INDEX "history_logs_user_id_idx" ON "history_logs"("user_id");

-- CreateIndex
CREATE INDEX "history_logs_log_type_idx" ON "history_logs"("log_type");

-- CreateIndex
CREATE UNIQUE INDEX "custom_modules_sip_id_key" ON "custom_modules"("sip_id");

-- CreateIndex
CREATE INDEX "custom_modules_status_idx" ON "custom_modules"("status");

-- CreateIndex
CREATE INDEX "custom_modules_created_by_idx" ON "custom_modules"("created_by");

-- CreateIndex
CREATE INDEX "module_fields_module_id_idx" ON "module_fields"("module_id");

-- CreateIndex
CREATE INDEX "module_fields_section_name_idx" ON "module_fields"("section_name");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_records_assessment_no_key" ON "assessment_records"("assessment_no");

-- CreateIndex
CREATE INDEX "assessment_records_module_id_idx" ON "assessment_records"("module_id");

-- CreateIndex
CREATE INDEX "assessment_records_athlete_id_idx" ON "assessment_records"("athlete_id");

-- CreateIndex
CREATE INDEX "assessment_records_assessed_by_idx" ON "assessment_records"("assessed_by");

-- CreateIndex
CREATE INDEX "assessment_records_assessment_date_idx" ON "assessment_records"("assessment_date");

-- CreateIndex
CREATE INDEX "jersey_products_supplier_id_idx" ON "jersey_products"("supplier_id");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "jersey_orders_order_no_key" ON "jersey_orders"("order_no");

-- CreateIndex
CREATE INDEX "jersey_orders_customer_id_idx" ON "jersey_orders"("customer_id");

-- CreateIndex
CREATE INDEX "jersey_orders_club_id_idx" ON "jersey_orders"("club_id");

-- CreateIndex
CREATE INDEX "jersey_orders_supplier_id_idx" ON "jersey_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "jersey_orders_status_idx" ON "jersey_orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_tracking_order_id_idx" ON "order_tracking"("order_id");


-- Foreign Key Constraints
ALTER TABLE "users" ADD CONSTRAINT "users_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_perpani_id_fkey" FOREIGN KEY ("perpani_id") REFERENCES "perpani"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scoring_records" ADD CONSTRAINT "scoring_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id")ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_inventory" ADD CONSTRAINT "asset_inventory_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "asset_maintenance_logs" ADD CONSTRAINT "asset_maintenance_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset_inventory"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "training_schedules"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "club_organizations" ADD CONSTRAINT "club_organizations_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_fields" ADD CONSTRAINT "module_fields_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "custom_modules"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_records" ADD CONSTRAINT "assessment_records_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "custom_modules"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_records" ADD CONSTRAINT "assessment_records_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "jersey_products"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders"("id")ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "jersey_products"("id")ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders"("id")ON DELETE CASCADE ON UPDATE CASCADE;