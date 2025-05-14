/*
  Warnings:

  - The values [IndianBank] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('UPI', 'EuropeanBank', 'SwiftCode', 'Paypal', 'Stripe', 'Razorpay', 'Mollie', 'Cash', 'Cheque', 'GrowLimitLess', 'IndianBanks');
ALTER TABLE "Payments" ALTER COLUMN "payment_type" DROP DEFAULT;
ALTER TABLE "PaymentDetails" ALTER COLUMN "paymentType" TYPE "PaymentType_new" USING ("paymentType"::text::"PaymentType_new");
ALTER TABLE "Payments" ALTER COLUMN "payment_type" TYPE "PaymentType_new" USING ("payment_type"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
ALTER TABLE "Payments" ALTER COLUMN "payment_type" SET DEFAULT 'Cash';
COMMIT;
