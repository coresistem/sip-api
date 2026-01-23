/*
  Warnings:

  - Added the required column `category` to the `jersey_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `jersey_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jersey_orders" ADD COLUMN "payment_proof_url" TEXT;

-- CreateTable
CREATE TABLE "jersey_workers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "specialization" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "daily_capacity" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "worker_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worker_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "estimated_minutes" INTEGER,
    "actual_minutes" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "worker_tasks_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "jersey_workers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "worker_tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "inspector_id" TEXT NOT NULL,
    "total_qty" INTEGER NOT NULL DEFAULT 1,
    "passed_qty" INTEGER NOT NULL DEFAULT 0,
    "rejected_qty" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "notes" TEXT,
    "inspected_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "qc_inspections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_rejections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "defect_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "responsible_dept" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "qc_rejections_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "repair_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rejection_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_cost" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decided_by" TEXT,
    "decided_at" TIMESTAMP,
    "supplier_notes" TEXT,
    "actual_cost" REAL,
    "repaired_by" TEXT,
    "repaired_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "repair_requests_rejection_id_fkey" FOREIGN KEY ("rejection_id") REFERENCES "qc_rejections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courier_info" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "courier_name" TEXT NOT NULL,
    "awb_number" TEXT NOT NULL,
    "tracking_url" TEXT,
    "shipping_cost" REAL,
    "estimated_delivery" TIMESTAMP,
    "shipped_at" TIMESTAMP,
    "delivered_at" TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "courier_info_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "jersey_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
CREATE TABLE "new_jersey_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "design_url" TEXT,
    "design_thumbnail" TEXT,
    "base_price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_order_qty" INTEGER NOT NULL DEFAULT 1,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "allowed_clubs" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);
INSERT INTO "new_jersey_products" ("base_price", "created_at", "currency", "description", "design_thumbnail", "design_url", "id", "is_active", "min_order_qty", "name", "supplier_id", "updated_at") SELECT "base_price", "created_at", "currency", "description", "design_thumbnail", "design_url", "id", "is_active", "min_order_qty", "name", "supplier_id", "updated_at" FROM "jersey_products";
DROP TABLE "jersey_products";
ALTER TABLE "new_jersey_products" RENAME TO "jersey_products";
CREATE INDEX "jersey_products_supplier_id_idx" ON "jersey_products"("supplier_id");
CREATE UNIQUE INDEX "jersey_products_supplier_id_sku_key" ON "jersey_products"("supplier_id", "sku");

-- CreateIndex
CREATE INDEX "jersey_workers_supplier_id_idx" ON "jersey_workers"("supplier_id");

-- CreateIndex
CREATE INDEX "worker_tasks_worker_id_idx" ON "worker_tasks"("worker_id");

-- CreateIndex
CREATE INDEX "worker_tasks_order_id_idx" ON "worker_tasks"("order_id");

-- CreateIndex
CREATE INDEX "worker_tasks_status_idx" ON "worker_tasks"("status");

-- CreateIndex
CREATE INDEX "qc_inspections_order_id_idx" ON "qc_inspections"("order_id");

-- CreateIndex
CREATE INDEX "qc_inspections_inspector_id_idx" ON "qc_inspections"("inspector_id");

-- CreateIndex
CREATE INDEX "qc_inspections_status_idx" ON "qc_inspections"("status");

-- CreateIndex
CREATE INDEX "qc_rejections_inspection_id_idx" ON "qc_rejections"("inspection_id");

-- CreateIndex
CREATE INDEX "qc_rejections_responsible_dept_idx" ON "qc_rejections"("responsible_dept");

-- CreateIndex
CREATE INDEX "qc_rejections_status_idx" ON "qc_rejections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "repair_requests_rejection_id_key" ON "repair_requests"("rejection_id");

-- CreateIndex
CREATE INDEX "repair_requests_status_idx" ON "repair_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "courier_info_order_id_key" ON "courier_info"("order_id");
