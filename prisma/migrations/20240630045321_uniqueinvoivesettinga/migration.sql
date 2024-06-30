/*
  Warnings:

  - A unique constraint covering the columns `[user_id,id]` on the table `InvoiceSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InvoiceSettings_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSettings_user_id_id_key" ON "InvoiceSettings"("user_id", "id");
