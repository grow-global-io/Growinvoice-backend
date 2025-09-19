/*
  Warnings:

  - Made the column `phone` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_currencies_id_fkey";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "currencies_id" DROP NOT NULL,
ALTER COLUMN "billingAddress_id" DROP NOT NULL,
ALTER COLUMN "shippingAddress_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_currencies_id_fkey" FOREIGN KEY ("currencies_id") REFERENCES "Currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
