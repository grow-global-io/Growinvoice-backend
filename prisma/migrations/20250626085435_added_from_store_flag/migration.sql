-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "fromStore" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "fromStore" BOOLEAN NOT NULL DEFAULT false;
