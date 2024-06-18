-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_country_id_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_state_id_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "country_id" DROP NOT NULL,
ALTER COLUMN "state_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;
