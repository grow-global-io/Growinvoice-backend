-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency_id" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
