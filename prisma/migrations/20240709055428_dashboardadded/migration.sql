-- CreateEnum
CREATE TYPE "DashboardTypes" AS ENUM ('Table', 'Chart');

-- CreateTable
CREATE TABLE "AIDashboard" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "DashboardTypes" NOT NULL,

    CONSTRAINT "AIDashboard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIDashboard" ADD CONSTRAINT "AIDashboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
