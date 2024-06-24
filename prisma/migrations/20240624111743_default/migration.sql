/*
  Warnings:

  - Changed the type of `date` on the `Quotation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expiry_at` on the `Quotation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "expiry_at",
ADD COLUMN     "expiry_at" TIMESTAMP(3) NOT NULL;
