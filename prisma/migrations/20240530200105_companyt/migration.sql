/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_user_id_key" ON "Company"("user_id");
