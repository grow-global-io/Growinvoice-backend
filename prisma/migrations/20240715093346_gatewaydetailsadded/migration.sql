/*
  Warnings:

  - You are about to drop the column `enable` on the `PaymentDetails` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GateWayType" AS ENUM ('Stripe', 'Razorpay');

-- AlterTable
ALTER TABLE "PaymentDetails" DROP COLUMN "enable";

-- CreateTable
CREATE TABLE "GateWayDetails" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "type" "GateWayType" NOT NULL,
    "key" TEXT,
    "secret" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "GateWayDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GateWayDetails_type_user_id_key" ON "GateWayDetails"("type", "user_id");

-- AddForeignKey
ALTER TABLE "GateWayDetails" ADD CONSTRAINT "GateWayDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
