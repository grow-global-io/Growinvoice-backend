/*
  Warnings:

  - Added the required column `title` to the `AIDashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIDashboard" ADD COLUMN     "title" TEXT NOT NULL;
