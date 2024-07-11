-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'Cash';
