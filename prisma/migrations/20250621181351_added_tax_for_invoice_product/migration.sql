/*
  Warnings:

  - You are about to drop the column `tax_id` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tax_id_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "tax_id";

-- CreateTable
CREATE TABLE "InvoiceProductTax" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,

    CONSTRAINT "InvoiceProductTax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceProductTax_invoice_id_tax_id_key" ON "InvoiceProductTax"("invoice_id", "tax_id");

-- AddForeignKey
ALTER TABLE "InvoiceProductTax" ADD CONSTRAINT "InvoiceProductTax_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceProductTax" ADD CONSTRAINT "InvoiceProductTax_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceProductTax" ADD CONSTRAINT "InvoiceProductTax_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
