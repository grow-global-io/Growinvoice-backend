/*
  Warnings:

  - You are about to drop the column `billing_id` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_id` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `billingAddress_id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAddress_id` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_billing_id_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_shipping_id_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "billing_id",
DROP COLUMN "shipping_id",
ADD COLUMN     "billingAddress_id" TEXT NOT NULL,
ADD COLUMN     "shippingAddress_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_billingAddress_id_fkey" FOREIGN KEY ("billingAddress_id") REFERENCES "BillingAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_shippingAddress_id_fkey" FOREIGN KEY ("shippingAddress_id") REFERENCES "ShippingAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
