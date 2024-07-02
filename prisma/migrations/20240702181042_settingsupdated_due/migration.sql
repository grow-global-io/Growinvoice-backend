/*
  Warnings:

  - Added the required column `dueNotice` to the `QuotationSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overDueNotice` to the `QuotationSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuotationSettings" ADD COLUMN     "dueNotice" INTEGER NOT NULL,
ADD COLUMN     "overDueNotice" INTEGER NOT NULL;
