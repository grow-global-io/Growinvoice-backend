/*
  Warnings:

  - You are about to drop the column `tax_id` on the `Quotation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quotation" DROP CONSTRAINT "Quotation_tax_id_fkey";

-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "tax_id";
