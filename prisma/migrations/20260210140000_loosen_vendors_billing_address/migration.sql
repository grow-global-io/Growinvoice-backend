-- Make state_id and country_id nullable on VendorsBillingAddress
ALTER TABLE "VendorsBillingAddress"
  ALTER COLUMN "state_id" DROP NOT NULL,
  ALTER COLUMN "country_id" DROP NOT NULL;

-- Update foreign keys to SET NULL on delete
ALTER TABLE "VendorsBillingAddress" DROP CONSTRAINT IF EXISTS "VendorsBillingAddress_state_id_fkey";
ALTER TABLE "VendorsBillingAddress" DROP CONSTRAINT IF EXISTS "VendorsBillingAddress_country_id_fkey";

ALTER TABLE "VendorsBillingAddress"
  ADD CONSTRAINT "VendorsBillingAddress_state_id_fkey"
    FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorsBillingAddress"
  ADD CONSTRAINT "VendorsBillingAddress_country_id_fkey"
    FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
