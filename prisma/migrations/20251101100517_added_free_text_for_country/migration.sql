-- AlterTable
ALTER TABLE "BillingAddress" ADD COLUMN     "country_name" TEXT,
ADD COLUMN     "state_name" TEXT;

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "country_name" TEXT,
ADD COLUMN     "state_name" TEXT;
