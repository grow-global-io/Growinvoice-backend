/*
  Warnings:

  - You are about to drop the column `tax` on the `HSNCode` table. All the data in the column will be lost.
  - Added the required column `tax_id` to the `HSNCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HSNCode" DROP COLUMN "tax",
ADD COLUMN     "tax_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "HSNCode" ADD CONSTRAINT "HSNCode_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
