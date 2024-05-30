-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
