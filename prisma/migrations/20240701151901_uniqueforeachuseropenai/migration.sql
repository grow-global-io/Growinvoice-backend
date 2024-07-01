/*
  Warnings:

  - A unique constraint covering the columns `[user_id,query]` on the table `OpenAiHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OpenAiHistory_user_id_query_key" ON "OpenAiHistory"("user_id", "query");
