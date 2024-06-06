/*
  Warnings:

  - You are about to drop the column `currency_id` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `currencies_id` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_currency_id_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "currency_id",
ADD COLUMN     "currencies_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_currencies_id_fkey" FOREIGN KEY ("currencies_id") REFERENCES "Currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
