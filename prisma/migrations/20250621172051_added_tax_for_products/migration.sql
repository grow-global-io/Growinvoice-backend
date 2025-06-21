/*
  Warnings:

  - You are about to drop the column `tax_id` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tax_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "tax_id";

-- CreateTable
CREATE TABLE "TaxForProduct" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,

    CONSTRAINT "TaxForProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxForProduct_product_id_tax_id_key" ON "TaxForProduct"("product_id", "tax_id");

-- AddForeignKey
ALTER TABLE "TaxForProduct" ADD CONSTRAINT "TaxForProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxForProduct" ADD CONSTRAINT "TaxForProduct_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
