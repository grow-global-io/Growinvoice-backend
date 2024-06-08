/*
  Warnings:

  - You are about to drop the column `rate` on the `Tax` table. All the data in the column will be lost.
  - Added the required column `percentage` to the `Tax` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "rate",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL;
