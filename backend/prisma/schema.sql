-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "menus" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "desc" TEXT,
    "price" INTEGER NOT NULL,
    "image" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "modifierGroups" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "name" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(20) NOT NULL,
    "customer_name" VARCHAR(100) NOT NULL,
    "table" VARCHAR(20) NOT NULL,
    "total" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Diterima',
    "payment_status" VARCHAR(50) NOT NULL DEFAULT 'Belum Bayar',
    "payment_method" VARCHAR(50) NOT NULL DEFAULT 'QRIS',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "item_id" VARCHAR(20) NOT NULL,
    "order_id" VARCHAR(20) NOT NULL,
    "id" VARCHAR(50),
    "name" VARCHAR(150) NOT NULL,
    "price" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "modifier_total" INTEGER NOT NULL DEFAULT 0,
    "selectedModifiers" JSONB,
    "note" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Diterima',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "cms_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "theme_color" VARCHAR(7) NOT NULL DEFAULT '#AF8C53',
    "font_family" VARCHAR(100) NOT NULL DEFAULT '''Inter'', sans-serif',
    "hero_title" TEXT NOT NULL DEFAULT 'Selamat Datang di Rakit Coffee',
    "hero_subtitle" TEXT NOT NULL DEFAULT 'Nikmati racikan kopi premium dan hidangan lezat yang disiapkan khusus untuk menemani momen berharga Anda hari ini.',
    "hero_image" TEXT,
    "hero_title_color" VARCHAR(7) NOT NULL DEFAULT '#ffeec5',
    "hero_subtitle_color" VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    "hero_title_font" VARCHAR(100),
    "hero_subtitle_font" VARCHAR(100),
    "payment_acc_name" VARCHAR(100) NOT NULL DEFAULT 'Rakit Coffee',
    "payment_acc_no" VARCHAR(100) NOT NULL DEFAULT '123-456-7890',
    "payment_qris" TEXT,

    CONSTRAINT "cms_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_recipes" (
    "id" VARCHAR(50) NOT NULL,
    "menu_id" VARCHAR(50) NOT NULL,
    "stock_item_id" VARCHAR(50) NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "menu_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" VARCHAR(50) NOT NULL,
    "stock_item_id" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_recipes" ADD CONSTRAINT "menu_recipes_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_recipes" ADD CONSTRAINT "menu_recipes_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
