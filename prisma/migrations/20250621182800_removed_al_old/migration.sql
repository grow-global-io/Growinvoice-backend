/*
  Warnings:

  - You are about to drop the `InvoiceProductTax` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvoiceProductTax" DROP CONSTRAINT "InvoiceProductTax_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceProductTax" DROP CONSTRAINT "InvoiceProductTax_product_id_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceProductTax" DROP CONSTRAINT "InvoiceProductTax_tax_id_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "tax_id" TEXT;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "tax_id" TEXT;

-- DropTable
DROP TABLE "InvoiceProductTax";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;
