-- AlterTable
ALTER TABLE "Plans" ADD COLUMN     "currency_id" TEXT NOT NULL DEFAULT 'cm5wa4fki001r21tydt35127s';

-- AddForeignKey
ALTER TABLE "Plans" ADD CONSTRAINT "Plans_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
