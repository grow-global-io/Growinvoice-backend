-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currency_id" TEXT;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "currency_id" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
