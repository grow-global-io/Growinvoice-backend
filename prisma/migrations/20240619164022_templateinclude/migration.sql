-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "template_id" TEXT NOT NULL DEFAULT 'clxlxnejl0000p8jzyerh3li6';

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "invoiceTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
