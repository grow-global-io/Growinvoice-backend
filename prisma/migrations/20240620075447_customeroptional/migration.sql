/*
  Warnings:

  - Made the column `display_name` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "display_name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
