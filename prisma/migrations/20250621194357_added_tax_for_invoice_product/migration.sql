/*
  Warnings:

  - You are about to drop the column `tax_id` on the `InvoiceProducts` table. All the data in the column will be lost.
  - You are about to drop the column `tax_id` on the `QuotationProducts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvoiceProducts" DROP CONSTRAINT "InvoiceProducts_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "QuotationProducts" DROP CONSTRAINT "QuotationProducts_tax_id_fkey";

-- AlterTable
ALTER TABLE "InvoiceProducts" DROP COLUMN "tax_id";

-- AlterTable
ALTER TABLE "QuotationProducts" DROP COLUMN "tax_id";

-- CreateTable
CREATE TABLE "TaxForInvoiceProducts" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "invoiceProduct_id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,

    CONSTRAINT "TaxForInvoiceProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxForQuotationProducts" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "quotationProduct_id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,

    CONSTRAINT "TaxForQuotationProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaxForInvoiceProducts" ADD CONSTRAINT "TaxForInvoiceProducts_invoiceProduct_id_fkey" FOREIGN KEY ("invoiceProduct_id") REFERENCES "InvoiceProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxForInvoiceProducts" ADD CONSTRAINT "TaxForInvoiceProducts_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxForQuotationProducts" ADD CONSTRAINT "TaxForQuotationProducts_quotationProduct_id_fkey" FOREIGN KEY ("quotationProduct_id") REFERENCES "QuotationProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxForQuotationProducts" ADD CONSTRAINT "TaxForQuotationProducts_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
