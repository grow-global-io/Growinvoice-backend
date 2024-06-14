-- CreateEnum
CREATE TYPE "paidStatus" AS ENUM ('Paid', 'Unpaid');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paid_status" "paidStatus" NOT NULL DEFAULT 'Unpaid';
