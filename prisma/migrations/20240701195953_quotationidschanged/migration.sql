/*
  Warnings:

  - You are about to drop the column `hsnCode` on the `QuotationProducts` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `QuotationProducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuotationProducts" DROP COLUMN "hsnCode",
DROP COLUMN "tax",
ADD COLUMN     "hsnCode_id" TEXT,
ADD COLUMN     "tax_id" TEXT;

-- AddForeignKey
ALTER TABLE "QuotationProducts" ADD CONSTRAINT "QuotationProducts_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationProducts" ADD CONSTRAINT "QuotationProducts_hsnCode_id_fkey" FOREIGN KEY ("hsnCode_id") REFERENCES "HSNCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
