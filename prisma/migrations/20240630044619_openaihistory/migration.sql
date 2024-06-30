/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `InvoiceSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "OpenAiHistory" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "OpenAiHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSettings_user_id_key" ON "InvoiceSettings"("user_id");

-- AddForeignKey
ALTER TABLE "OpenAiHistory" ADD CONSTRAINT "OpenAiHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
