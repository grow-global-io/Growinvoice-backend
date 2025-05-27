-- CreateEnum
CREATE TYPE "invoiceHeadingType" AS ENUM ('COMPANY_NAME', 'COMPANY_LOGO');

-- AlterTable
ALTER TABLE "InvoiceSettings" ADD COLUMN     "invoiceHeadingType" "invoiceHeadingType" NOT NULL DEFAULT 'COMPANY_NAME';
