-- AlterTable
ALTER TABLE "BillingAddress" ALTER COLUMN "state_id" DROP NOT NULL,
ALTER COLUMN "country_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShippingAddress" ALTER COLUMN "state_id" DROP NOT NULL,
ALTER COLUMN "country_id" DROP NOT NULL;
