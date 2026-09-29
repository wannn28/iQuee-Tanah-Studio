-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PACKED', 'SHIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "blurb" VARCHAR(200) NOT NULL,
    "image" VARCHAR(80) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(32) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category_id" VARCHAR(32) NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "compare_at_cents" INTEGER,
    "images" JSONB NOT NULL,
    "short" VARCHAR(300) NOT NULL,
    "description" JSONB NOT NULL,
    "details" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "badge" VARCHAR(40),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "added_rank" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "code" VARCHAR(32) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "percent_off" INTEGER NOT NULL DEFAULT 0,
    "free_shipping" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "access_token" VARCHAR(64) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40),
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "address1" VARCHAR(160) NOT NULL,
    "address2" VARCHAR(160),
    "city" VARCHAR(80) NOT NULL,
    "region" VARCHAR(80) NOT NULL,
    "postal" VARCHAR(16) NOT NULL,
    "country" VARCHAR(60) NOT NULL,
    "shipping_method" VARCHAR(20) NOT NULL,
    "shipping_cents" INTEGER NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL,
    "payment_label" VARCHAR(80) NOT NULL,
    "promo_code" VARCHAR(32),
    "subtotal_cents" INTEGER NOT NULL,
    "discount_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" VARCHAR(32) NOT NULL,
    "product_name" VARCHAR(160) NOT NULL,
    "image" VARCHAR(80) NOT NULL,
    "options" JSONB NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "line_total_cents" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_price_cents_idx" ON "products"("price_cents");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_fkey" FOREIGN KEY ("promo_code") REFERENCES "promo_codes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
