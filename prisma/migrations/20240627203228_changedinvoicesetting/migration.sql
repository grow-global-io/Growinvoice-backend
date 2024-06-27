-- AlterTable
ALTER TABLE "InvoiceSettings" ALTER COLUMN "autoArchive" SET DEFAULT false,
ALTER COLUMN "footer" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL;
