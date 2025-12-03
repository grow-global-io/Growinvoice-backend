-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentType" ADD VALUE 'Revolut';
ALTER TYPE "PaymentType" ADD VALUE 'Wise';

-- AlterTable
ALTER TABLE "InvoiceProducts" ADD COLUMN     "discount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PaymentDetails" ADD COLUMN     "bankName" TEXT;

-- AlterTable
ALTER TABLE "ProductPriceBook" ADD COLUMN     "shippingCharges" DOUBLE PRECISION DEFAULT 0;
