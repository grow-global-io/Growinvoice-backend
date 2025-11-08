-- CreateEnum
CREATE TYPE "PlanPaymentType" AS ENUM ('Stripe', 'Growlimitless', 'Razorpay');

-- AlterTable
ALTER TABLE "UserPlans" ADD COLUMN     "payment_type" "PlanPaymentType" NOT NULL DEFAULT 'Stripe';
