/*
  Warnings:

  - You are about to drop the column `currency_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_currency_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "currency_id",
DROP COLUMN "price";

-- CreateTable
CREATE TABLE "ProductPriceBook" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency_id" TEXT NOT NULL,

    CONSTRAINT "ProductPriceBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPriceBook_product_id_currency_id_key" ON "ProductPriceBook"("product_id", "currency_id");

-- AddForeignKey
ALTER TABLE "ProductPriceBook" ADD CONSTRAINT "ProductPriceBook_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceBook" ADD CONSTRAINT "ProductPriceBook_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
