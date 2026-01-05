-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InvoiceSettings" ADD COLUMN     "enableReminder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderInterval" INTEGER NOT NULL DEFAULT 0;
